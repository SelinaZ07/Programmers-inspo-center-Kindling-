import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// This is temporary data, will come from badatabase later
const defaultIdeas = [
  {
    id: 1,
    title: "AI Study Planner",
    category: "Daily Life Improvements",
    details:
      "Students enter their classes, assignments, exams, and available study time. The application creates a personalized study schedule and adjusts it as deadlines change.",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
    author: "Evelyn Sterling",
    date: "2026-08-20",
  },

  {
    id: 2,
    title: "Community Food Sharing",
    category: "Social Issues",
    details:
      "Restaurants, grocery stores, and individuals can post extra food that would otherwise be thrown away. Nearby users or community organizations can claim the food.",
    image:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9",
    author: "Maya Wilson",
    date: "2026-08-18",
  },

  {
    id: 3,
    title: "Campus Lost & Found",
    category: "Community / Personal Issues",
    details:
      "Students can report lost and found items, upload pictures, and search for items based on categories and locations.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
    author: "Alex Chen",
    date: "2026-08-15",
  },

  {
    id: 4,
    title: "Accessible Travel Planner",
    category: "Social Issues",
    details:
      "Users can plan trips while filtering locations, transportation, restaurants, and attractions by accessibility features.",
    image:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828",
    author: "Noah Smith",
    date: "2026-08-12",
  },

  {
    id: 5,
    title:"Neighborhood Skill Exchange",
    category: "Community / Personal Issues",
    details:
      "Users can offer skills such as tutoring, cooking, design, coding, or home repair in exchange for another skill.",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac",
    author: "Lena Brown",
    date: "2026-08-10",
  },

  {
    id: 6,
    title: "Smart Transportation",
    category:"Social Issues",
    details:
      "The app combines public transportation schedules, bike routes, walking routes, and ride-sharing information in one place.",
    image:
      "https://images.unsplash.com/photo-1519003722824-194d4455a60c",
    author: "Jordan Lee",
    date: "2026-08-05",
  },
];

function Inspirations() {
  //load in the ideas in the db (will come from supabase later)
  const [ideas, setIdeas] = useState(() => {
    try {
      const storedIdeas = localStorage.getItem("kindlingIdeas");
      return storedIdeas ? JSON.parse(storedIdeas) : defaultIdeas;
    } catch (error) {
      console.error("Error loading ideas:", error);
      return defaultIdeas;
    }
  });

  const createSummary = (details) => {
    const words = details.trim().split(/\s+/);
    if (words.length <= 15) {
      return details.trim();
    }
    return words.slice(0, 15).join(" ") + "...";
  };


  //States:
  //Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedIdea, setSelectedIdea] = useState(null);

  //save idea state, these are stored in local browser for now
  const [savedIdeas, setSavedIdeas] = useState(() => {
    try {
      const saved = localStorage.getItem("kindlingSavedIdeas");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading saved ideas from localStorage:", error);
      return [];
    }
  });

  //Add button states
  const [submitOpen, setSubmitOpen] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaDetails, setNewIdeaDetails] = useState("");
  const [newIdeaImage, setNewIdeaImage] = useState(null);
  const [newIdeaCategory, setNewIdeaCategory] = useState("");

  //This search bar filter
  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "" ||
      idea.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  //The save idea function
  const toggleSaveIdea = () => {
    if (!selectedIdea) {
      return;
    }

    setSavedIdeas((prevSavedIdeas) => {
      const isAlreadySaved = prevSavedIdeas.some(
        (idea) => idea.id === selectedIdea.id
      );

      let updatedIdeas;
      if (isAlreadySaved) {
        //remove the idea from saved ideas
        updatedIdeas = prevSavedIdeas.filter(
          (idea) => idea.id !== selectedIdea.id
        );
      } else {
        updatedIdeas = [...prevSavedIdeas, selectedIdea];
      }

      //save to browser storage (this might be temporary, have to rethink
      localStorage.setItem("kindlingSavedIdeas", JSON.stringify(updatedIdeas));
      return updatedIdeas;
    });
  };

  const fileToDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmitIdea = async (event) => {
    event.preventDefault();

    if (!newIdeaTitle.trim() || 
    !newIdeaDetails.trim() ||
    !newIdeaCategory) 
    {
      return;
    }
    let imageURL = "https://images.unsplash.com/photo-1499750310107-5fef28a66643";

    //convert uploaded image into persistent data url (this will be replaced with supabase storage later)
    if (newIdeaImage) {
      try {
        imageURL = await fileToDataURL(newIdeaImage);
      } catch (error) {
        console.error("Error converting image to data URL:", error);
      }
    }

    //new idea variable
    const newIdea ={
      id: Date.now(),
      title: newIdeaTitle,
      category: newIdeaCategory,
      details: newIdeaDetails,
      image: imageURL,
      author: "Evelyn Sterling",
      date: new Date().toISOString(),
    };

    setIdeas((previousIdeas) => {
      const updatedIdeas = [ 
      newIdea,
      ...previousIdeas,
      ];

      localStorage.setItem(
        "kindlingIdeas",
        JSON.stringify(updatedIdeas)
      );

      return updatedIdeas;
    });

  // Clear the form
  setNewIdeaTitle("");
  setNewIdeaCategory("");
  setNewIdeaDetails("");
  setNewIdeaImage(null);

  // Close the popup
  setSubmitOpen(false);
};


  return (
    <>
      <Navbar />

      <main className="inspirations-page">
        <button className="add-inspiration-button"
          onClick={() => setSubmitOpen(true)} aria-label="SUbmit an inspiration">
          <i className="fa-solid fa-plus"></i>
          <span>ADD</span>
        </button>

        <section className="inspirations-header">
          <div>
            <h1>Inspirations</h1>
            <p className="inspirations-description">
              Share your creative software ideas with hackers! It can be websites, Apps, anything!
            </p>
          </div>
        </section>

        {/* Search and filters*/}
        <section className= "idea-controls">
          <input type="text"
            className="idea-search"
            placeholder="Search project ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="idea-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">
              All Categories
            </option>

            <option value="Social Issues">
              Social Issues
            </option>

            <option value="Creative Projects">
              Creative Projects
            </option>

            <option value="Daily Life Improvements">
              Daily Life Improvements
            </option>

            <option value="Community / Personal Issues">
              Community / Personal Issues
            </option>

            <option value="Other">
              Other
            </option>
          </select>

        </section>

        {/* The ideas display grid*/}
        <section className="inspiration-grid">

          {filteredIdeas.length === 0 ? (
            <div className="no-ideas">
              <h2>No ideas found</h2>
              <p>Try changing your search or category filter.</p>
            </div>
          ) : (
            filteredIdeas.map((idea) => (
              <article
                key={idea.id}
                className="inspiration-card"
                onClick={() => setSelectedIdea(idea)}
              >
                <div className="inspiration-image-wrapper">
                  <img src={idea.image} alt={idea.title} className="inspiration-image" />
                </div>

                <div className="inspiration-card-content">
                  <span className="inspiration-category">
                    {idea.category}
                  </span>

                  <h2> {idea.title}</h2>
                  <p>{createSummary(idea.details)}</p>
                  <div className="inspiration-author">
                    By {idea.author}
                  </div>

                </div>
              </article>
            ))
          )}
        </section>
      </main>

      {/*Idea modal popup when clicked on it*/}
      {selectedIdea && (
        <div className="idea-modal" onClick={(event) =>{
            if (event.target === event.currentTarget) {
              setSelectedIdea(null);
            }
          }}>

          <div className="idea-modal-content">
            <button
              className="idea-modal-close"
              onClick={() => setSelectedIdea(null)}
            >
              &times;
            </button>

            <img
              src={selectedIdea.image}
              alt={selectedIdea.title}
              className="idea-modal-image"
            />
            <div className="idea-modal-text">

              <span className="inspiration-category">
                {selectedIdea.category}
              </span>

              <h2>{selectedIdea.title}</h2>
              <p>{selectedIdea.details}</p>
              <p className="idea-modal-author">
                Submitted by {selectedIdea.author}
              </p>

              {/*the save button*/}
              <button className={`idea-save-button ${savedIdeas.some((idea) =>
                idea.id === selectedIdea.id) ? "saved" : ""}`}
                onClick={toggleSaveIdea} aria-label="Save this idea">
                {/*there's the toggle between the save and unsave icon*/}
                <i className={savedIdeas.some((idea) => idea.id === selectedIdea.id)
                  ? "fa-solid fa-bookmark"
                  : "fa-regular fa-bookmark"}>
                </i>
                <span>save</span>
              </button>

            </div>
          </div>
        </div>
      )}

      {/*the "add idea" pop up section*/}
      {submitOpen && (
        <div className="submit-idea-overlay"
          onClick={(event) =>{
            if (event.target === event.currentTarget) {
              setSubmitOpen(false);
            }
          }}
        >
          <div className="submit-idea-modal">
            <button
              className="submit-idea-close"
              onClick={() =>setSubmitOpen(false)}
            >
              &times;
            </button>

            <div className="submit-idea-header">
              <h2>Submit an Inspiration</h2>
              <p>Share your ideas with others!</p>
            </div>

            <form onSubmit={handleSubmitIdea}>

              {/* Idea title */}
              <div className="form-group">

                <label htmlFor="idea-title">
                  Idea Title
                </label>
                <input
                  id="idea-title"
                  type="text"
                  placeholder="Give your idea a name..."
                  value={newIdeaTitle}
                  onChange={(event) =>
                    setNewIdeaTitle(event.target.value)
                  }
                  required
                />
              </div>

              {/* Idea Category selection */}
              <div className="form-group">

                <label htmlFor="idea-category">
                  Category
                </label>

                <select
                  id="idea-category"
                  value={newIdeaCategory}
                  onChange={(event) =>
                    setNewIdeaCategory(event.target.value)
                  }
                  required
                >
                  <option value="">
                    Select a category
                  </option>

                  <option value="Social Issues">
                    Social Issues
                  </option>

                  <option value="Creative Projects">
                    Creative Projects
                  </option>

                  <option value="Daily Life Improvements">
                    Daily Life Improvements
                  </option>

                  <option value="Community / Personal Issues">
                    Community / Personal Issues
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              {/* Idea details */}
              <div className= "form-group">
                <label htmlFor="idea-details">
                  Details
                </label>

                <textarea
                  id="idea-details"
                  placeholder="Tell us about your idea..."
                  value={newIdeaDetails}
                  onChange={(event) => setNewIdeaDetails(event.target.value)}
                  required
                />
              </div>

              {/* Image upload inside the add section pop up modal */}
              <div className="form-group">
                <label htmlFor="idea-image">
                  Upload an Image
                </label>

                <input
                  id="idea-image"
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setNewIdeaImage(event.target.files[0])
                  }
                />
              </div>

              {/* Buttons of add idea popup */}
              <div className= "submit-idea-actions">

                <button type="button"
                  className="cancel-idea-button"
                  onClick={() => setSubmitOpen(false)}>
                  Cancel
                </button>

                <button type="submit" className="submit-idea-button">
                  Submit Idea
                </button>
              </div>
              
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default Inspirations;