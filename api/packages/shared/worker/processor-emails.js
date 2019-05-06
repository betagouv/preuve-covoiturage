module.exports = (db, sendEmail) => async job => sendEmail({
  email: job.data.email,
  fullname: job.data.fullname,
  subject: job.data.subject,
  content: job.data.content,
});
