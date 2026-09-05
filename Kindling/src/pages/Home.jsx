import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Home() {
  //this is for the short brief displayed on the ideas card
  const createSummary = (details) => {
    return details
      .trim()
      .split(/\s+/)
      .slice(0, 15)
      .join(" ") + "...";
  };

  // These are just temporary placeholder ideas, later will be linked to backend db instead.
  const inspirationIdeas =[
    {
      id: 1,
      title: "AI Study Planner",
      category: "Daily Life Improvements",
      details:
        "An AI-powered planner that helps students organize their studying.",
      image:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
      author: "Evelyn Sterling",
    },

    {
      id: 2,
      title: "Community Food Sharing",
      category: "Social Issues",
      details:
        "A platform that helps people share excess food with their local community.",
      image:
        "https://images.unsplash.com/photo-1488459716781-31db52582fe9",
      author: "Maya Wilson",
    },
    {
      id: 3,
      title: "Campus Lost & Found",
      category: "Community / Personal Issues",
      details:
        "A centralized platform where university students can report lost and found items.",
      image:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
      author: "Alex Chen",
    },
    {
      id: 4,
      title: "Accessible Travel Planner",
      category: "Social Issues",
      details:
        "A travel planning application designed around accessibility needs.",
      image:
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828",
      author: "Noah Smith",
    },
    {
      id: 5,
      title: "Neighborhood Skill Exchange",
      category: "Community / Personal Issues",
      details:
        "A platform where people can exchange skills with others nearby.",
      image:
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac",
      author: "Lena Brown",
    },
    {
      id: 6,
      title: "Smart Transportation",
      category: "Social Issues",
      details:
        "An application designed to make transportation more efficient.",
      image:
        "https://images.unsplash.com/photo-1519003722824-194d4455a60c",
      author: "Jordan Lee",
    },
  ];


  // Randomly select 3 ideas
  const getRandomIdeas = (ideas, count) => {
    const shuffled = [...ideas].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const [featuredIdeas] = useState(() =>
    getRandomIdeas(inspirationIdeas, 3)
  );


  return (
    <>
      <Navbar/>

      <section className="home">
        <img className="image-background" src="/Tech_Vison_Board.jpg" alt="background image"/>
        <div className="overlay"></div>

        <div className="Big-header">
          <h1>Welcome to Kindling</h1>
        </div>
      </section>

      <div className="content">
        <h2>About Our Project</h2>
        <p>
          Kindling is a site where people share coding project ideas and other hackers find inspirations and built it out.
          This can be website idea, mobile app ideas and anything digital. Alternatively, you can also express an issue
          that you hope to be solved by softwares. There is no ago restrictions and we are open to ANY ideas. If you can
          think of it, someone will be able to build it. You don't have to be a hacker to submit ideas on here. However,
          we welcome hackers to take inspirations from here to build their own projects. Projects built from an inspiration
          on this site can be submitted back to the idea own to get user feedback:)
        </p>

        <h2>Why I build this project?</h2>
        <p>
          As a hacker myself, I am always struggling to come up with fun and creative things to code, either just for fun or for hackathons. 
          One because I am not so creative, two is that hackers often run out of ideas to build. Additionally, I also want
          to build projects that can actually help people. However, coming from a developed country, we often have a lack
          of knowledge of what underpriviledged communities actually needs. So I built this site to encourage creative
          ideas and connect people's needs to hackers. 
        </p>
      </div>

      {/* Featured Projects sections*/}
      <section className="featured-projects">
        <div className="project-section-header">

          <h2> Featured Project Ideas of the Week</h2>
          <p className="project-section-description">
            Explore a few ideas from the Kindling community.
          </p>
        </div>

        <div className="project-grid">
          {featuredIdeas.map((idea) => (
            <article key={idea.id} className="project-card">
              <img src={idea.image} alt={idea.title} className="project-card-image"/>

              <div className="project-card-content">
                <span className="project-category">
                  {idea.category}
                </span>

                <h3>{idea.title}</h3>
                <p className="project-summary">
                  {createSummary(idea.details)}
                </p>

                <a href="/inspirations" className="project-view-button">
                  Explore Idea
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;