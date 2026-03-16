import React from 'react';

const CardDashboard = ({ cards = [] }) => (
  <div className="row">
    {cards.map(({ label, value, color, icon }) => (
      <div className="col-xl-4 col-md-4 mb-4" key={label}>
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
);

export default CardDashboard;