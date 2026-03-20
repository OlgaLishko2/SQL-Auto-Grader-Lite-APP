import emailjs from "@emailjs/browser";


export const sendAssignmentEmail = async (student, assignment) => {
  if (!student?.email) {
    console.error("Cannot send email: student email is empty!", student);
    return;
  }

  try {
    await emailjs.send(
      "service_3npd20t",
      "template_w1onkew",
      {
    name: student.fullName,
    email: student.email,
    title: assignment.title,
    date: assignment.dueDate,
      },
      "5FzJhHSACG7-28zpP"
    );
    console.log(`Email sent to ${student.email}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};







