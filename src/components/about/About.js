import React from 'react';

const About = () => {
  return (
    <div className="about-card">
     
     


      <section style={{ marginBottom: '40px' }}>
        <h1 style={{ color: '#566f9e', fontSize: '36px', marginBottom: '15px' }}>
          About SQL Auto Grader
        </h1>
        <p style={{ color: '#5e6d82', fontSize: '18px', lineHeight: '1.8', maxWidth: '900px' }}>
          SQL Auto Grader is an advanced educational framework designed to automate the evaluation 
          of relational database queries. Our platform bridges the gap between theoretical database 
          design and practical execution, providing real-time validation for students and 
          comprehensive analytics for educators.
        </p>
      </section>



      <section style={{ marginBottom: '50px' }}>
        <h3 style={{ color: '#1a2b4b', borderBottom: '2px solid #f0f4f8', paddingBottom: '10px' }}>
          Our Mission
        </h3>
        <p style={{ color: '#5e6d82', fontSize: '16px', lineHeight: '1.7' }}>
          We believe that database management is a core pillar of modern software engineering. 
          Our mission is to democratize high-quality SQL education by providing a scalable, 
          open-access tool that gives every student the same level of detailed feedback 
          they would receive from a personal tutor.
        </p>
      </section>

      <hr style={{ border: '0', borderTop: '1px solid #eef2f6', margin: '40px 0' }} />

  
      <section>
        <h3 style={{ color: '#1a2b4b', marginBottom: '20px' }}>Get in Touch</h3>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '50px', 
          background: '#ffffff',
          padding: '10px'
        }}>
          <div>
            <strong style={{ color: '#1a2b4b' }}>General Inquiries</strong><br />
            <a href="mailto:info@sql-grader.com" style={{ color: '#4a76c5', textDecoration: 'none' }}>info@sql-grader.com</a>
          </div>
          <div>
            <strong style={{ color: '#1a2b4b' }}>Technical Support</strong><br />
            <a href="mailto:support@sql-grader.com" style={{ color: '#4a76c5', textDecoration: 'none' }}>support@sql-grader.com</a>
          </div>
          <div>
            <strong style={{ color: '#1a2b4b' }}>Location</strong><br />
            <span style={{ color: '#5e6d82' }}>123 Logic Lane, Tech District, San Francisco, CA 94105</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;