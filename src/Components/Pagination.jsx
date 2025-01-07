import React from "react";
import ReactPaginate from "react-paginate";
const Pagination = ({ onPageChange, totalData, itemsPerPage, currentPage }) => {
  // if API returns total data then calculate page count by the following way otherwise page count (total Pages will be provided in the APi itself)
  const totalPages = Math.ceil(totalData / itemsPerPage);
  const shouldShowPagination = totalData > itemsPerPage;
  return (
    <>
      {shouldShowPagination && (
        <ReactPaginate
          previousLabel={"<"}
          nextLabel={">"}
          pageCount={totalPages}
          onPageChange={onPageChange}
          containerClassName={"pagination-container"}
          previousLinkClassName={"navigation-link"}
          nextLinkClassName={"navigation-link"}
          disabledClassName={"pagination__link--disabled"}
          activeClassName={"active-link"}
          pageClassName={"page-link"}
          forcePage={currentPage - 1}
        />
      )}
    </>
  );
};

export default Pagination;
