export const CreateAssignment = ({formData, handleChange})=>{
    return(
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "500px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label htmlFor="title">Title</label>
              <input
                id="title" name="title" placeholder="Assignment title"
                value={formData.title} onChange={handleChange}
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description" name="description" placeholder="Describe the assignment..."
                value={formData.description} onChange={handleChange}
                rows={4}
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                <label htmlFor="due_date">Due Date</label>
                <input
                  id="due_date" type="date" name="due_date"
                  value={formData.due_date} onChange={handleChange}
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
              </div>
            </div>
          </div>
)}