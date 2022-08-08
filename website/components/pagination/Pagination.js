import React, { useEffect, useState } from 'react'

function Pagination({ allItemsArray, filteredArray, perPage, updateArrayState }) {

    // Initialize current tournament page
    const [currentPage, setCurrentPage] = useState(1);
    // Initialize number of elements per page
    const [elementsPerPage, setElementsPerPage] = useState(perPage);

    const [indexOfLastElement, setIndexOfLastElement] = useState();
    const [indexOfFirstElement, setIndexOfFirstElement] = useState();
    const [pageNumbers, setPageNumbers] = useState();
    var [isPaginationInitialised, setIsPaginationInitialised] = useState(false);


    useEffect(() => {
        // if (isPaginationInitialised) return;
        initialisePagination();
    }, [allItemsArray])

    useEffect(() => {
        updatePagination(currentPage);
    }, [currentPage])

    // Pagination Functions

    function initialisePagination() {
        // if (!allItemsArray || isPaginationInitialised) return;
        if (!allItemsArray) return;
        setIndexOfLastElement((currentPage * elementsPerPage));
        setIndexOfFirstElement(((currentPage * elementsPerPage) - elementsPerPage));
        updateArrayState(Array.from(allItemsArray).slice(((currentPage * elementsPerPage) - elementsPerPage), (currentPage * elementsPerPage)));
        const pageNumbersArray = []
        for (let i = 1; i <= Math.ceil(allItemsArray.length / elementsPerPage); i++) {
            pageNumbersArray.push(i);
        }
        setPageNumbers(pageNumbersArray);
        setIsPaginationInitialised(true);
    }

    //Udpate pagination after clicking other page
    function updatePagination(pageNum) {
        if (!allItemsArray) return;
        setIndexOfLastElement(pageNum * elementsPerPage);
        setIndexOfFirstElement(((pageNum * elementsPerPage) - elementsPerPage));
        updateArrayState(Array.from(allItemsArray).slice(((currentPage * elementsPerPage) - elementsPerPage), (currentPage * elementsPerPage)));
    }

    return filteredArray && (
        <div className="col12 spacetop2">
            {allItemsArray.length > filteredArray.length &&
                <div className='row jc-center' style={{ textAlign: "center" }}>
                    <div className='col-auto' style={{ width: "fit-content" }}>
                        <div className='row jc-around'>
                            {(currentPage - 1) > 0 ?
                                <p className="my-page-item size2" onClick={() => setCurrentPage(currentPage - 1)}><a className="my-page-link">Previous</a></p>
                                :
                                <p className="my-page-item size2"><a className="my-page-link disabled">Previous</a></p>
                            }
                            {pageNumbers.map((pageNum, idx) =>
                            (
                                <p key={idx} className="my-page-item size2"><a className={`my-page-link ${pageNum == currentPage ? 'active' : ""}`} onClick={() => setCurrentPage(pageNum)}>{pageNum}</a></p>
                            ))}
                            {(currentPage + 1) <= pageNumbers.length ?
                                <p className="my-page-item size2" onClick={() => setCurrentPage(currentPage + 1)}><a className="my-page-link">Next</a></p>
                                :
                                <p className="my-page-item size2"><a className="my-page-link disabled">Next</a></p>
                            }

                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default Pagination