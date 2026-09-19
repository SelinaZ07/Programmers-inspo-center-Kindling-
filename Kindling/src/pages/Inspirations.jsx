import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { supabase } from "../lib/supabaseClient";


function Inspirations() {
  //load in the ideas in the db 
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIdeas = async () => {
      const { data, error } = await supabase
        .from("inspirations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading inspirations:", error);
        setLoading(false);
        return;
      }

      setIdeas(data);
      setLoading(false);
    };

    loadIdeas();
  }, []);

  // Load saved ideas for the currently logged-in user
  useEffect(() => {
    const loadSavedIdeas = async () => {
      // Get the currently logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Could not get logged-in user:", userError);
        setSavedIdeasLoading(false);
        return;
      }

      // Get this user's saved inspirations
      const { data, error } = await supabase
        .from("saved_inspirations")
        .select(`
          inspiration_id,
          inspirations (*)
        `)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error loading saved inspirations:", error);
        setSavedIdeasLoading(false);
        return;
      }

      // Convert the joined data into the same format
      const ideas = data
        .map((item) => item.inspirations)
        .filter(Boolean);

      setSavedIdeas(ideas);
      setSavedIdeasLoading(false);
    };

    loadSavedIdeas();
  }, []);

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

  // Saved ideas for the currently logged-in user
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [savedIdeasLoading, setSavedIdeasLoading] = useState(true);

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
  const toggleSaveIdea = async () => {
    if (!selectedIdea) {
      return;
    }

    // Get the currently logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Could not get logged-in user:", userError);
      return;
    }

    const isAlreadySaved = savedIdeas.some(
      (idea) => idea.id === selectedIdea.id
    );

    if (isAlreadySaved) {
      // Remove the saved idea from Supabase
      const { error } = await supabase
        .from("saved_inspirations")
        .delete()
        .eq("user_id", user.id)
        .eq("inspiration_id", selectedIdea.id);

      if (error) {
        console.error("Error removing saved inspiration:", error);
        return;
      }

      // Update the UI
      setSavedIdeas((previousIdeas) =>
        previousIdeas.filter(
          (idea) => idea.id !== selectedIdea.id
        )
      );
    } else {
      // Save the idea in Supabase
      const { error } = await supabase
        .from("saved_inspirations")
        .insert({
          user_id: user.id,
          inspiration_id: selectedIdea.id,
        });

      if (error) {
        console.error("Error saving inspiration:", error);
        return;
      }

      // Update the UI
      setSavedIdeas((previousIdeas) => [
        ...previousIdeas,
        selectedIdea,
      ]);
    }
  };

  const handleSubmitIdea = async (event) => {
    event.preventDefault();

    //get the current logged in user data
    const {
      data: {user},
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user){
      console.error("Could not get logged-in user:", userError);
      return;
    }

    // Make sure required fields are filled in
    if (
      !newIdeaTitle.trim() ||
      !newIdeaDetails.trim() ||
      !newIdeaCategory
    ) {
      return;
    }

    try {
      let imageURL =
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643";

      // If the user uploaded an image, upload it to Supabase Storage
      if (newIdeaImage) {
        // Create a unique file name
        const fileExtension = newIdeaImage.name.split(".").pop();

        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExtension}`;

        const filePath = `${user.id}/${fileName}`;

        // Upload the image
        const { error: uploadError } = await supabase.storage
          .from("inspiration-images")
          .upload(filePath, newIdeaImage);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          return;
        }

        console.log("Image uploaded successffully!")

        // Get the public URL
        const { data: publicURLData } = supabase.storage
          .from("inspiration-images")
          .getPublicUrl(filePath);

        imageURL = publicURLData.publicUrl;
      }

      // Insert the new inspiration into the database
      const { data, error } = await supabase
        .from("inspirations")
        .insert([
          {
            title: newIdeaTitle.trim(),
            category: newIdeaCategory,
            details: newIdeaDetails.trim(),
            image_url: imageURL,
            author: user.email, //will change to username later
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating inspiration:", error);
        return;
      }

      // Add the newly created inspiration to the page
      setIdeas((previousIdeas) => [data, ...previousIdeas]);

      // Clear the form
      setNewIdeaTitle("");
      setNewIdeaCategory("");
      setNewIdeaDetails("");
      setNewIdeaImage(null);

      // Close the popup
      setSubmitOpen(false);
    } catch (error) {
      console.error("Unexpected error submitting inspiration:", error);
    }
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

          {/*Add in a loading state*/}
          {loading ? (
            <div className="no-ideas">
              <h2>Loading ideas...</h2>
            </div>
          ) : filteredIdeas.length === 0 ? (
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
                  <img src={idea.image_url} alt={idea.title} className="inspiration-image" />
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
              src={selectedIdea.image_url}
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
                  ? "fa-solid fa-bookmark" //The save icon
                  : "fa-regular fa-bookmark"//the unsave icon
                  }>
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