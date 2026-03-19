
import emailjs from "@emailjs/browser";


export const sendAssignmentEmail = async (studentEmail, studentName, assignmentTitle) => {
  const serviceID = "service_ARXAJFSC"; 
  const templateID = "template_w1onkew";    
  const publicKey = "template_w1onkew";  

  const templateParams = {
    to_email: studentEmail,
    to_name: studentName,
    assignment_title: assignmentTitle,
  };

  try {
    const result = await emailjs.send(serviceID, templateID, templateParams, publicKey);
    console.log("Email sent!", result.text);
  } catch (error) {
    console.error("Email error:", error);
  }
};