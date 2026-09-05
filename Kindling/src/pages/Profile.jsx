import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Profile() {

  // This is just temporary placeholder data, 
  // will replace with actual databse later
  const creations = [
    {
      id: 1,
      projectName: "Campus Lost & Found",
      ideaTitle: "Community / Personal Issues",
      category: "Community / Personal Issues",
      githubLink: "https://github.com/example/campus-lost-found",
      demoLink: "https://campus-lost-found.example.com",
      description:
        "A centralized platform where university students can report lost and found items.",
      images: [
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
      ],
      author: "evelyn.sterling",
    },
    {
      id: 2,
      projectName: "AI Study Planner",
      ideaTitle: "AI study planner",
      category: "Daily Life Improvements",
      githubLink: "https://github.com/example/ai-study-planner",
      demoLink: "https://ai-study-planner.example.com",
      description:
        "An AI-powered application that creates personalized study schedules for students.",
      images: [
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173"],
      author: "evelyn.sterling",
    },
    {
      id: 3,
      projectName: "Community Food Sharing",
      ideaTitle: "Community Food Sharing",
      category: "Social Issues",
      githubLink: "https://github.com/example/food-sharing",
      demoLink: "https://food-sharing.example.com",
      description:
        "A platform that helps communities redistribute excess food instead of throwing it away.",
      images:
        ["https://images.unsplash.com/photo-1488459716781-31db52582fe9"],
      author: "evelyn.sterling",
    },
  ];

  //the save state for the collection tab
  const [collections] = useState(() => {
    try {
      const saved = localStorage.getItem("kindlingSavedIdeas");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error(error);
      return [];
    }
  });

  //This are some placeholder inspirations, will be linked to backend user db later
  //Should be the inspirations users have added
  const inspirations =[
    {
      id: 6,
      title:"Neighborhood Skill Exchange",
      category: "Community / Personal Issues",
      description: "A platform where people can exchange skills and help each other locally.",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac",
      author: "Maya Wilson",
    },
    {
      id: 7,
      title: "Accessible Travel Planner",
      category: "Social Issues",
      description: "A travel planning application designed around accessibility needs.",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828",
      author: "Noah Smith",
    },
  ];

  //change profile photo upload function
  const handleProfilePhotoChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfilePhoto(event.target.result);
    };
    reader.onerror = () =>{
      console.error("Could not read profile image");
    };
    reader.readAsDataURL(file);
  };

  // States
  const [activeTab, setActiveTab] = useState("creations");
  const [selectedPost, setSelectedPost] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userCreations, setUserCreations] = useState(()=>{
    //saving the created creations in the browser for now
    try {
      const savedCreations = localStorage.getItem("kindlingCreations");
      return savedCreations ? JSON.parse(savedCreations) : creations;
    } catch (error) {
      console.error("error loading creations:", error);
      return creations;
    }
  });

  //states for edit profile
  const [editProfileOpen, setEditProfileOpen] = useState(false);

   //Below are the profile infos, save all profile in the local browser for now.
  const [profilePhoto, setProfilePhoto] = useState(() => {
    try {
      const savedProfile = JSON.parse(
        localStorage.getItem("kindlingProfile")
      );
      return savedProfile?.profilePhoto || "/profile-photo.jpg";
    } catch {
      return "/profile-photo.jpg";
    }
  });

  const [profileBio, setProfileBio] = useState(() =>{
    try {
      const savedProfile = JSON.parse(
        localStorage.getItem("kindlingProfile")
      );
      return savedProfile?.profileBio || "Here is my short bio";
    } catch {
      return "Here is my short bio";
    }
  });

  const [birthday, setBirthday] = useState(() => {
    try {
      const savedProfile = JSON.parse(
        localStorage.getItem("kindlingProfile")
      );
      return savedProfile?.birthday || "";
    } catch {
      return "";
    }
  });

  const [username, setUsername] = useState(() => {
    try {
      const savedProfile = JSON.parse(
        localStorage.getItem("kindlingProfile")
      );

      return savedProfile?.username || "Username";
    } catch {
      return "Username";
    }
  });

  //states for add creation
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [workedOnIdea, setWorkedOnIdea] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [demoLink, setDemoLink] = useState("");
  const [projectImages, setProjectImages] = useState([]);

  //useEffect for profile data update
  useEffect(() => {
    const profileData = {
      username,
      profilePhoto,
      profileBio,
      birthday,
    };

    localStorage.setItem(
      "kindlingProfile",
      JSON.stringify(profileData)
    );
  }, [
    username,
    profilePhoto,
    profileBio,
    birthday,
  ]);

  //useEffect for updating creations uploads
  useEffect(() => {
    localStorage.setItem(
      "kindlingCreations",
      JSON.stringify(userCreations)
    );
  }, [userCreations]);

  // Get the posts for each relevant tab
  let currentPosts = [];

  if (activeTab === "creations") {
    currentPosts = userCreations;
  } else if (activeTab === "collections") {
    currentPosts = collections;
  } else if (activeTab === "inspirations") {
    currentPosts = inspirations;
  }

  //the function to handle the project images upload
  const handleProjectImagesChange = (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) {
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        setProjectImages((previousImages) => [
          ...previousImages,
          event.target.result,
        ]);
      };

      reader.onerror = () => {
        console.error("Could not read project image");
      };
      reader.readAsDataURL(file);
    });
  };

  //project submission function
  const handleSubmitProject = (event) => {
    event.preventDefault();

    if (
      !projectName.trim() ||
      !workedOnIdea.trim()
    ) {
      return;
    }

    const imageURLs = projectImages;
    //creating  a new project the users made
    const newProject = {
      id: Date.now(),
      projectName: projectName,
      ideaTitle: workedOnIdea,
      category: "New Project",
      githubLink: githubLink,
      demoLink: demoLink,
      description: "Project description will be added later.",
      images:
        imageURLs.length > 0
          ? imageURLs
          : [
            "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
          ],
      author: username,
    };

    setUserCreations((previousCreations) => [
      newProject,
      ...previousCreations,
    ]);

    // Reset form
    setProjectName("");
    setWorkedOnIdea("");
    setGithubLink("");
    setDemoLink("");
    setProjectImages([]);

    //Close popup after submission
    setCreateProjectOpen(false);
    setActiveTab("creations");
  };


  return (
    <>
      <Navbar />

      <div className="profile-page">
        <div className="profile-menu">
          <button className="profile-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open profile menu">
            <i className="fa-solid fa-bars"></i>
          </button>

          {menuOpen && (
            <div className="profile-dropdown">
              <button type="button" onClick={() => setMenuOpen(false)}>Setting</button>
              <button type="button" onClick={() => setMenuOpen(false)}>Login Info</button>
              <button type="button" onClick={() => setMenuOpen(false)}>Report</button>
            </div>
          )}
        </div>

        <section className="profile-header">
          <img src={profilePhoto} alt="Profile" className="profile-photo"/>

          <h1>{username}</h1>
          <p className="profile-bio">{profileBio}</p>

          <button className="edit-profile-btn" onClick={() => setEditProfileOpen(true)}>
            Edit Profile
          </button>
        </section>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={
              activeTab ==="creations"
                ? "profile-tab active" : "profile-tab"}
            onClick={() => setActiveTab("creations")}>
            Creations
          </button>

          <button
            className={
              activeTab === "collections" ? "profile-tab active" : "profile-tab"}
            onClick={() => setActiveTab("collections")}>
            Collections
          </button>

          <button
            className={
              activeTab === "inspirations" ? "profile-tab active" : "profile-tab"}
            onClick={() => setActiveTab("inspirations")}>
            Inspirations
          </button>

        </div>

        {/* the posts/projects grid section */}
        <section className="profile-grid">

          {activeTab === "creations" && (
            <button className="create-project-card"
              onClick={() => setCreateProjectOpen(true)}>

              <span className="plus-icon"> + </span>
              <span className="create-project-text">
                Add a Project
              </span>
            </button>
          )}

          {/* Saved posts in collection */}
          {currentPosts.length === 0 && activeTab === "collections" ? (
            <div className="empty-collection">
              <h2>No saved inspirations yet</h2>
              <p>All saved inspirations will appear here.</p>
            </div>

          ) : (
            currentPosts.map((post) => (
              <article key={post.id} className="profile-post"
                onClick={() => setSelectedPost(post)} >

                <img
                  src={post.images ? post.images[0] : post.image}
                  alt={post.projectName || post.title}
                  className="profile-post-image"
                />

                <div className="profile-post-overlay">
                  <h3>{post.projectName || post.title}</h3>
                  <p>{post.category}</p>
                </div>
              </article>
            ))
          )}
        </section>

        {/*pop up modal for each inspo posts*/}
        {selectedPost && (
          <div
            className="profile-modal"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedPost(null);
              }
            }}>

            <div className="profile-modal-content">
              <button
                className="profile-modal-close"
                onClick={() => setSelectedPost(null)}>
                &times;
              </button>

              <img
                src={selectedPost.images ? selectedPost.images[0] : selectedPost.image}
                alt={selectedPost.projectName || selectedPost.title}
                className="profile-modal-image" />

              <div className="profile-modal-info">
                <span className="profile-category">
                  {selectedPost.category}
                </span>

                <h2>{selectedPost.projectName || selectedPost.title}</h2>

                {selectedPost.ideaTitle && (
                  <div className="project-detail">
                    <h3>Idea Title</h3>
                    <p>{selectedPost.ideaTitle}</p>
                  </div>
                )}

                {(selectedPost.description || selectedPost.details) && (
                  <div className="project-detail">
                    <h3>{selectedPost.details ? "Idea Details" : "Description"}</h3>
                    <p>{selectedPost.description || selectedPost.details}</p>
                  </div>
                )}

                {selectedPost.githubLink && (
                  <div className="project-detail">
                    <h3>GitHub Link</h3>
                    <a href={selectedPost.githubLink} target="_blank" rel="noopener noreferrer">
                      View Github Repository
                    </a>
                  </div>
                )}

                {selectedPost.demoLink && (
                  <div className="project-detail">
                    <h3>Demo Link</h3>
                    <a href={selectedPost.demoLink} target="_blank" rel="noopener noreferrer">
                      View Demo
                    </a>
                  </div>
                )}

                <p className="profile-author">
                  Created by {selectedPost.author}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/*Edit profile pop up modal*/}
      {editProfileOpen && (

        <div
          className="edit-profile-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setEditProfileOpen(false);
            }
          }}>

          <div className="edit-profile-modal">

            <button className="edit-profile-close"
              onClick={() => setEditProfileOpen(false)}>
              &times;
            </button>

            <div className="edit-profile-header">
              <h2>Edit Profile</h2>
              <p>Update your profile information.</p>
            </div>

            {/* Username */}
            <div className="edit-form-group">
              <label htmlFor="username">
                Username
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                placeholder="Enter your username..."
              />
            </div>

            {/* Profile Photo */}
            <div className="edit-photo-section">

              <label>Profile Photo</label>
              <div className="edit-photo-preview">
                <img src={profilePhoto} alt="Profile preview" />
                <label htmlFor="profile-photo-input" className="change-photo-button">
                  Change Photo
                </label>

                <input
                  id="profile-photo-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleProfilePhotoChange}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="edit-form-group">

              <label htmlFor="profile-bio">
                Bio
              </label>
              <textarea
                id="profile-bio"
                value={profileBio}
                onChange={(event) =>
                  setProfileBio(event.target.value)
                }
                placeholder="Tell people a little about yourself..."
              />
            </div>

            {/* Birthday */}
            <div className="edit-form-group">
              <label htmlFor="birthday">
                Birthday
              </label>

              <input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(event) =>
                  setBirthday(event.target.value)
                }
              />
            </div>

            {/* Buttons */}
            <div className="edit-profile-actions">

              <button type="button"
                className="edit-cancel-button"
                onClick={() => setEditProfileOpen(false)} >
                Cancel
              </button>

              <button type="button"
                className="edit-save-button"
                onClick={() => setEditProfileOpen(false)}>
                Save Changes
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Create project popup */}
      {createProjectOpen && (
        <div
          className="create-project-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setCreateProjectOpen(false);
            }
          }}>

          <div className="create-project-modal">
            <button
              className="create-project-close"
              onClick={() => setCreateProjectOpen(false)}>
              &times;
            </button>

            {/*Content inside edit profile*/}
            <div className="create-project-header">
              <h2>Add a Project</h2>
              <p>Share about the project you made!</p>
            </div>

            <form onSubmit={handleSubmitProject}>
              <div className="project-form-group">

                <label htmlFor="project-name">
                  Project Name
                </label>

                <input
                  id="project-name"
                  type="text"
                  placeholder="Enter your project name..."
                  value={projectName}
                  onChange={(event) =>
                    setProjectName(event.target.value)
                  }
                  required
                />
              </div>

              {/* Inspiration / Idea */}
              <div className="project-form-group">
                <label htmlFor="worked-on-idea">
                  Idea You Worked On
                </label>

                <input
                  id="worked-on-idea"
                  type="text"
                  placeholder="Search for the inspiration title..."
                  value={workedOnIdea}
                  onChange={(event) =>
                    setWorkedOnIdea(event.target.value)
                  }
                  required
                />

                <small>
                  Search functionality will be connected to the
                  Inspirations database later.
                </small>
              </div>

              {/* GitHub */}
              <div className="project-form-group">
                <label htmlFor="github-link">
                  GitHub Link
                </label>

                <input
                  id="github-link"
                  type="url"
                  placeholder="https://github.com/..."
                  value={githubLink}
                  onChange={(event) =>
                    setGithubLink(event.target.value)
                  }
                />
              </div>

              {/* Demo */}
              <div className="project-form-group">

                <label htmlFor="demo-link">
                  Demo Link
                </label>

                <input
                  id="demo-link"
                  type="url"
                  placeholder="https://..."
                  value={demoLink}
                  onChange={(event) =>
                    setDemoLink(event.target.value)
                  }
                />
              </div>

              {/* Photos */}
              <div className="project-form-group">

                <label htmlFor="project-images">
                  Project Photos
                </label>

                <input
                  id="project-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleProjectImagesChange}
                />

                <small>
                  You can select multiple photos.
                </small>
              </div>

              {/* Buttons */}
              <div className="create-project-actions">

                <button type="button"
                  className="project-cancel-button"
                  onClick={() => setCreateProjectOpen(false)}>
                  Cancel
                </button>

                <button type="submit"
                  className="project-submit-button" >
                  Submit Project
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

export default Profile;