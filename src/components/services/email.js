
import emailjs from "@emailjs/browser";

const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const TEMPLATE_ID_STUDENT = process.env.REACT_APP_EMAILJS_TEMPLATE_ID_STUDENT;
const TEMPLATE_ID_TEACHER = process.env.REACT_APP_EMAILJS_TEMPLATE_ID_TEACHER;
const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;


export const sendAssignmentEmail = async (student, assignmentTitle, assignmentDueDate, assignmentId) => {

  if (!student?.email) {
    console.error("Cannot send email: student email is empty!", student);
    return;
  }

  try {
    await emailjs.send(
          SERVICE_ID,
          TEMPLATE_ID_STUDENT,
          {
        name: student.fullName,
        email: student.email,
        title: assignmentTitle,
        date: assignmentDueDate,
        link: `${window.location.origin}/dashboard/questions/${assignmentId}`,
          },
          PUBLIC_KEY
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
          SERVICE_ID,
          TEMPLATE_ID_STUDENT,
          {
        name: student.fullName,
        email: student.email,
        title: assignmentTitle,
        date: new Date().toLocaleDateString("en-CA"),
        link: `${window.location.origin}/dashboard/quizzes/${assignmentId}`,
          },
          PUBLIC_KEY
        );
    console.log(`Email sent to ${student.email}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export const sendSubmissionNotificationEmail = async (teacher, studentName, assignmentTitle) => {
  if (!teacher?.email) return;
  try {
    await emailjs.send(
          SERVICE_ID,
          TEMPLATE_ID_TEACHER,
          {
            name: teacher.fullName,
            email: teacher.email,
            title: `${studentName} has submitted: ${assignmentTitle}`,
            link: `${window.location.origin}/dashboard/submissionstatus`,
          },
          PUBLIC_KEY
        );
  } catch (error) {
    console.error("Error sending submission notification:", error);
  }
};

export const sendReminderEmail = async (student, assignmentTitle, assignmentDueDate, assignmentId) => {
  if (!student?.email) return;
  try {
    await emailjs.send(
          SERVICE_ID,
          TEMPLATE_ID_STUDENT,
          {
            name: student.fullName,
            email: student.email,
            title: `Reminder: ${assignmentTitle}`,
            date: assignmentDueDate,
        link: `${window.location.origin}/dashboard/questions/${assignmentId}`,
          },
          PUBLIC_KEY
        );
    console.log(`Reminder sent to ${student.email}`);
  } catch (error) {
    console.error("Error sending reminder:", error);
  }
};
