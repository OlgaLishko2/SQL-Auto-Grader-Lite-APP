
import emailjs from "@emailjs/browser";


export const sendAssignmentEmail = async (student, assignmentTitle, assignmentDueDate, assignmentId) => {

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
    title: assignmentTitle,
    date: assignmentDueDate,
    link: `${window.location.origin}/dashboard/assignments/${assignmentId}`,
      },
      "5FzJhHSACG7-28zpP"
    );
    console.log(`Email sent to ${student.email}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};


export const sendQuizEmail = async (student, assignmentTitle, assignmentId) => {

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
    title: assignmentTitle,
    link: `${window.location.origin}/dashboard/quizes/${assignmentId}`,
      },
      "5FzJhHSACG7-28zpP"
    );
    console.log(`Email sent to ${student.email}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export const sendReminderEmail = async (student, assignmentTitle, assignmentDueDate, assignmentId) => {
  if (!student?.email) return;
  try {
    await emailjs.send(
      "service_3npd20t",
      "template_w1onkew",
      {
        name: student.fullName,
        email: student.email,
        title: `Reminder: ${assignmentTitle}`,
        date: assignmentDueDate,
        link: `${window.location.origin}/dashboard/assignments/${assignmentId}`,
      },
      "5FzJhHSACG7-28zpP"
    );
    console.log(`Reminder sent to ${student.email}`);
  } catch (error) {
    console.error("Error sending reminder:", error);
  }
};
