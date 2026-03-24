import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "./student/LoadingOverlay";


import { getAllAssignmnetByStudent } from '../../components/model/studentAssignments';
import { getAllCompletedAssignmnetByStudent } from "../../components/model/studentAssignments";

import userSession from '../../components/services/UserSession';



const CardDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const [assignmentsdata, setAssignmentsdata] = useState([]);
  const [submissionsdata, setsubmissionsdata] = useState([]);

 
  useEffect(() => {
    // Get data from assignments table from firebase
    const fetchdata = async () => {
      try {
        const data = await getAllAssignmnetByStudent(userSession.uid);
        setAssignmentsdata(Array.isArray(data) ? data : []);

        const pdata = await getAllCompletedAssignmnetByStudent(userSession.uid);
        setsubmissionsdata(pdata);

      } catch (error) {
        console.error("Error:", error);
      }finally {
            setIsLoading(false);
      }
    };

    fetchdata();
  }, []);

  const pendingAssignments = assignmentsdata.length;
  const submittedAssignments = submissionsdata.length;

  const studentCards = [
  { key: "assignments", label: "Pending Assignments (Total)", 
    value:pendingAssignments, color: "primary", icon: "fa-clipboard-list",
    path: "/dashboard/assignments"},

  { label: "Submitted Assignments (Count)", value: submittedAssignments,
     color: "success", icon: "fa-percent" , path: "/dashboard/results" },

  { label: "Total Quizzes", value: 18, color: "warning", icon: "fa-comments" },
];
  return(
    <>
      <LoadingOverlay isOpen={isLoading} message="Loading..." />
    <div className="row">
      {studentCards.map(({ label, value, color, icon ,path }) => (
        <div className="col-xl-4 col-md-4 mb-4" key={label}
           style={{ cursor: "pointer" }}
          onClick={() => navigate(path)}>
          <div className={`card border-left-${color} shadow h-100 py-2`}>
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className={`text-xs font-weight-bold text-${color} text-uppercase mb-1`}>{label}</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{value}</div>
                </div>
                <div className="col-auto">
                  <i className={`fas ${icon} fa-2x text-gray-300`}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
              <div className="row">
                     <div className="col-lg-12 mb-4">
                          <div className="card shadow mb-4">
                                <div className="card-header py-3">
                                    <h6 className="m-0 font-weight-bold text-primary">Projects</h6>
                                </div>
                                <div className="card-body">
                                    <h4 className="small font-weight-bold">Server Migration <span
                                            className="float-right">20%</span></h4>
                                    <div className="progress mb-4">
                                        <div className="progress-bar bg-danger" role="progressbar" style = {{ width: "20%" }}
                                            aria-valuenow="20" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                    <h4 className="small font-weight-bold">Sales Tracking <span
                                            className="float-right">40%</span></h4>
                                    <div className="progress mb-4">
                                        <div className="progress-bar bg-warning" role="progressbar" style={{ width: "40%" }}
                                            aria-valuenow="40" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                    <h4 className="small font-weight-bold">Customer Database <span
                                            className="float-right">60%</span></h4>
                                    <div className="progress mb-4">
                                        <div className="progress-bar" role="progressbar" style={{ width: "60%" }}
                                            aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                    <h4 className="small font-weight-bold">Payout Details <span
                                            className="float-right">80%</span></h4>
                                    <div className="progress mb-4">
                                        <div className="progress-bar bg-info" role="progressbar" style={{ width: "80%" }}
                                            aria-valuenow="80" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                    <h4 className="small font-weight-bold">Account Setup <span
                                            className="float-right">Complete!</span></h4>
                                    <div className="progress">
                                        <div className="progress-bar bg-success" role="progressbar" style={{ width: "100%" }}
                                            aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                </div>
                            </div>

                           

                        </div>

                     
                    </div>
    </>
  )
};

export default CardDashboard;