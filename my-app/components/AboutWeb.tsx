"use client"; // Ensure this runs only on the client
import React from "react";
import teamData from "@/components/Team"
import '@/styles/Aboutuss.css'; // Import the new CSS file
import Image from "next/image";
interface TeamMember {
  image: string;
  name: string;
  role: string;
}
const AboutWeb = () => {

  return (
    <div className="about-us">
      <div className="stars">

        <Image
          src="/images/arrow3.png"
          alt="Star"
          width={50}
          height={50}
          className="starsmall"
          priority
        />
      </div>

      <div className="about-us-header">
        <h2>We are the people who make up Innovations</h2>
        <p>
          Our team of expert data scientists, innovative thinkers, and industry
          leaders have built the ultimate inventory management solution to
          revolutionize your operations. Backed by cutting-edge AI, we ensure
          efficiency, accuracy, and scalability for your business needs.
        </p>
        <Image
          src="/images/cross1.png"
          alt="Close"
          width={24}
          height={24}
          className="close-icon"
        />      </div>

      <div className="team-container">
        {teamData.map((member, index) => (
          <div className="team-member" key={index}>
            <Image
              src={member.image}
              alt={member.name}
              width={200}
              height={200}
              className="member-image"
            />
            <h3>{member.name}</h3>
            <p>{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutWeb;
