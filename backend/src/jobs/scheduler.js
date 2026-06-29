const cron = require('node-cron');
const { exec } = require('child_process');
const logger = require('./logger');
const { prisma } = require('../config/database');

const backupDatabase = () => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `backup_${timestamp}.sql`;

  exec(`pg_dump ${process.env.DATABASE_URL} > ${filename}`, (error) => {
    if (error) {
      logger.error('Backup failed:', error.message);
      return;
    }

    logger.info(`Backup completed: ${filename}`);
    
    // Upload to S3 (example - requires AWS credentials)
    // exec(`aws s3 cp ${filename} s3://${process.env.BACKUP_BUCKET}/backups/${filename}`);
  });
};

// Run daily at 2:00 AM
cron.schedule('0 2 * * *', () => {
  logger.info('Starting daily database backup...');
  backupDatabase();
});

// Run weekly on Sunday at 3:00 AM for full backup
cron.schedule('0 3 * * 0', () => {
  logger.info('Starting weekly full database backup...');
  backupDatabase();
});

// Cleanup old backups (older than 30 days)
cron.schedule('0 4 * * *', async () => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);

  try {
    // Cleanup old audit logs
    const deletedLogs = await prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        action: { notIn: ['USER_DELETION_REQUESTED'] }
      }
    });

    // Cleanup old quiz attempts (older than 90 days)
    const oldAttempts = await prisma.quizAttempt.findMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: 'COMPLETED'
      },
      select: { id: true }
    });

    if (oldAttempts.length > 0) {
      await prisma.$transaction([
        prisma.quizAnswer.deleteMany({
          where: { attemptId: { in: oldAttempts.map(a => a.id) } }
        }),
        prisma.quizAttempt.deleteMany({
          where: { id: { in: oldAttempts.map(a => a.id) } }
        })
      ]);
    }

    logger.info(`Cleanup completed: ${deletedLogs.count} audit logs, ${oldAttempts.length} quiz attempts removed`);
  } catch (error) {
    logger.error('Cleanup failed:', error.message);
  }
});

module.exports = {
  backupDatabase,
  startScheduledJobs: () => {
    logger.info('Scheduled jobs started');
  }
};