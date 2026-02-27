import React from 'react';
const CardDashboard = () => {
    return(
            <div className="row">
                 {/* Assignments */}
                        <div className="col-xl-4 col-md-4 mb-4">
                            <div className="card border-left-primary shadow h-100 py-2">
                                <div className="card-body">
                                    <div className="row no-gutters align-items-center">
                                        <div className="col mr-2">
                                            <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                                Assignments (Total)</div>
                                            <div className="h5 mb-0 font-weight-bold text-gray-800">40</div>
                                        </div>
                                        <div className="col-auto">
                                            <i className="fas  fa-clipboard-list fa-2x text-gray-300"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Results */}
                        <div className="col-xl-4 col-md-4 mb-4">
                            <div className="card border-left-success shadow h-100 py-2">
                                <div className="card-body">
                                    <div className="row no-gutters align-items-center">
                                        <div className="col mr-2">
                                            <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                                Result (Percentage)</div>
                                            <div className="h5 mb-0 font-weight-bold text-gray-800">80%</div>
                                        </div>
                                        <div className="col-auto">
                                            <i className="fas fa-percent fa-2x text-gray-300"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/* Quizzes */}
                     <div className="col-xl-4 col-md-4 mb-4">
                            <div className="card border-left-warning shadow h-100 py-2">
                                <div className="card-body">
                                    <div className="row no-gutters align-items-center">
                                        <div className="col mr-2">
                                            <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                                Total Quizzes</div>
                                            <div className="h5 mb-0 font-weight-bold text-gray-800">18</div>
                                        </div>
                                        <div className="col-auto">
                                            <i className="fas fa-comments fa-2x text-gray-300"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
    )
}

export default CardDashboard