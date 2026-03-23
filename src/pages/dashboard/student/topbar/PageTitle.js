const PageTitle = ({pagetitle}) => {
    return(
        <div className="d-sm-flex align-items-center justify-content-between mb-4">
          <h1 className="h3 mb-0 text-dashboard-title" style={{marginTop:'10%'}}>{pagetitle}</h1>
         </div>
    )
}

export default PageTitle
