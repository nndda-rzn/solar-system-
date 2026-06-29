const createPaginatedResponse = (data, page = 1, limit = 10, total = null) => {
  const totalPages = total ? Math.ceil(total / limit) : null;
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: totalPages ? page < totalPages : null,
      hasPreviousPage: page > 1
    }
  };
};

const getPaginationParams = (query) => {
  let page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || 10;

  page = Math.max(1, page);
  limit = Math.min(Math.max(1, limit), 100); // Max 100 per page

  return { page, limit };
};

const calculateOffset = (page, limit) => {
  return (page - 1) * limit;
};

const getSkipAndTake = (page, limit) => {
  return {
    skip: calculateOffset(page, limit),
    take: limit
  };
};

const createSortObject = (sortBy, order = 'asc') => {
  const validOrder = order === 'desc' ? 'desc' : 'asc';
  
  if (!sortBy) {
    return { createdAt: validOrder };
  }

  return {
    [sortBy]: validOrder
  };
};

module.exports = {
  createPaginatedResponse,
  getPaginationParams,
  calculateOffset,
  getSkipAndTake,
  createSortObject
};