import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {supabase} from "../lib/supabaseClient";

function Profile() {
  //the logout helper function
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut({
      scope: "local",
    });

    if (error) {
      console.error("Logout error:", error);
    }
  };


  //the save state for the collection tab
  const [collections, setCollections] = useState([]);
  const [unsavingCollectionId, setUnsavingCollectionId] = useState([]);

  //change profile photo upload function
  const handleProfilePhotoChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    // Remember the actual file for the Supabase upload
    setProfilePhotoFile(file);
    // Show a preview immediately
    const reader = new FileReader();

    reader.onload = (event) => {
      setProfilePhoto(event.target.result);
    };
    reader.onerror = () => {
      console.error("Could not read profile image");
    };
    reader.readAsDataURL(file);
  };

  // States
  const [activeTab, setActiveTab] = useState("creations");
  const [selectedPost, setSelectedPost] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  //State for loading in data/posts
  const [userCreations, setUserCreations] = useState([]);
  const [userInspirations, setUserInspirations] = useState([]);
  const[profileDataLoading, setProfileDataLoading] = useState(true);

  //states for edit profile
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  //profile information
  const [profilePhoto, setProfilePhoto] = useState("/profile-photo.jpg");
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profileBio, setProfileBio] = useState("");
  const [birthday, setBirthday] = useState("");
  const [username, setUsername] = useState("Username");

  //loading/saving state fr profile
  const [profileSaving, setProfileSaving] = useState(false);

  // Load the logged-in user's profile from Supabase
  useEffect(() => {
    const loadProfile = async () => {
      // Get the logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Could not get current user:", userError);
        return;
      }

      // Get this user's profile
      const { data, error } = await supabase
        .from("profiles")
        .select("username, bio, birthday, profile_photo_url")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading profile:", error);
        return;
      }

      // Load profile information into React state
      if (data) {
        setUsername(data.username || "Username");
        setProfileBio(data.bio || "");
        setBirthday(data.birthday || "");
        setProfilePhoto(
          data.profile_photo_url || "/profile-photo.jpg"
        );
      }
    };

    loadProfile();
  }, []);

  //states for add creation
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [workedOnIdea, setWorkedOnIdea] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [demoLink, setDemoLink] = useState("");
  const [projectImages, setProjectImages] = useState([]);


  // Get the posts for each relevant tab
  let currentPosts = [];

  if (activeTab === "creations") {
    currentPosts = userCreations;
  } else if (activeTab === "collections") {
    currentPosts = collections;
  } else if (activeTab === "inspirations") {
    currentPosts = userInspirations;
  }

  //populate the profile posts from supabase
  useEffect(() => {
    const loadProfilePosts = async () => {
      // Get the currently logged-in user
      const {
        data: {user},
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Could not get current user:", userError);
        setProfileDataLoading(false);
        return;
      }

      // 1. Load user's projects
      const {
        data: projectsData,
        error: projectsError,
      } = await supabase
        .from("projects")
        .select(`
          *,
          project_images (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (projectsError) {
        console.error("Error loading projects:", projectsError);
      } else {
        const formattedProjects = projectsData.map((project) => ({
          id: project.id,
          projectName: project.project_name,
          ideaTitle: project.idea_title,
          category: project.category,
          githubLink: project.github_url,
          demoLink: project.demo_url,
          description: project.description,
          images: project.project_images
            ? project.project_images.map(
                (image) => image.image_url
              )
            : [],
          author: username,
        }));

        setUserCreations(formattedProjects);
      }

      // 2. Load user's saved inspirations
      const {
        data: savedData,
        error: savedError,
      } = await supabase
        .from("saved_inspirations")
        .select(`
          inspiration_id,
          inspirations (*)
        `)
        .eq("user_id", user.id);

      if (savedError) {
        console.error(
          "Error loading saved inspirations:",
          savedError
        );
      } else {
        const formattedCollections = savedData
          .map((item) => {
            const idea= item.inspirations;
            if (!idea){
              return null;
            } 
            return{
            id: idea.id,
            inspirationId: item.inspiration_id,
            title: idea.title,
            category: idea.category,
            details: idea.details,
            image: idea.image_url,
            author: idea.author,
          };
        }) 
        .filter(Boolean);

        setCollections(formattedCollections);
      }

      // 3. Load user's submitted inspirations
      const {
        data: inspirationsData,
        error: inspirationsError,
      } = await supabase
        .from("inspirations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (inspirationsError) {
        console.error(
          "Error loading user's inspirations:",
          inspirationsError
        );
      } else {
        const formattedInspirations = inspirationsData.map(
          (idea) => ({
            id: idea.id,
            title: idea.title,
            category: idea.category,
            details: idea.details,
            image: idea.image_url,
            author: idea.author,
          })
        );

        setUserInspirations(formattedInspirations);
      }

      setProfileDataLoading(false);
    };

    loadProfilePosts();
  }, [username]);

  // Remove an inspiration from the user's saved collections
  const handleUnsaveCollection = async (inspirationId) => {
    setUnsavingCollectionId(inspirationId);

    try {
      // Get the currently logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Could not get current user:", userError);
        return;
      }

      // Remove the saved inspiration from Supabase
      const { error } = await supabase
        .from("saved_inspirations")
        .delete()
        .eq("user_id", user.id)
        .eq("inspiration_id", inspirationId);

      if (error) {
        console.error("Error unsaving inspiration:", error);
        return;
      }

      // Remove it from the Collections tab immediately
      setCollections((previousCollections) =>
        previousCollections.filter(
          (idea) => idea.inspirationId !== inspirationId
        )
      );

      // If the modal was showing this inspiration, close it
      if (
        selectedPost &&
        selectedPost.inspirationId === inspirationId
      ) {
        setSelectedPost(null);
      }

    } catch (error) {
      console.error(
        "Unexpected error unsaving inspiration:",
        error
      );
    } finally {
      setUnsavingCollectionId(null);
    }
  };

  //the function to handle the project images upload
  const handleProjectImagesChange = (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) {
      return;
    }
    setProjectImages(files);
  };

  //project submission function
  const handleSubmitProject = async (event) => {
    event.preventDefault();

    if (!projectName.trim() || !workedOnIdea.trim()) {
      return;
    }

    try {
      //get current logged-in user
      const {
        data: {user},
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user){
        console.error("Could not get current user:", userError);
        return;
      }

      const uploadedImageURLs = [];
      
      // 1. Create the project database row
      const {
        data: project,
        error: projectError,
      } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          project_name: projectName.trim(),
          idea_title: workedOnIdea.trim(),
          category: "New Project",
          description: "Project description will be added later.",
          github_url: githubLink.trim() || null,
          demo_url: demoLink.trim() || null,
        })
        .select()
        .single();

      if (projectError) {
        console.error(
          "Error creating project:",
          projectError
        );
        return;
      }

      // 2. Upload each project image
      for (const file of projectImages) {
        const fileExtension = file.name
          .split(".")
          .pop();

        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExtension}`;

        //store each user's images inside their own folder
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } =
          await supabase.storage
            .from("project-images")
            .upload(filePath, file);

        if (uploadError) {
          console.error(
            "Error uploading project image:",
            uploadError
          );
          return;
        }

        //3. Get public URL for images
        const { data: publicURLData } =
          supabase.storage
            .from("project-images")
            .getPublicUrl(filePath);

        const imageURL = publicURLData.publicUrl;

        // 4. Store image URL in project_images
        const { error: imageDatabaseError } =
          await supabase
            .from("project_images")
            .insert({
              project_id: project.id,
              image_url: imageURL,
            });

        if (imageDatabaseError) {
          console.error(
            "Error saving project image:",
            imageDatabaseError
          );
          return;
        }
      }

      //use a fallback image if the user didn't upload one
      const finalImages = uploadedImageURLs.length>0
      ? uploadedImageURLs : [
         "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
      ];

      // 5. Add project to current React state
      const newProject = {
        id: project.id,
        projectName: project.project_name,
        ideaTitle: project.idea_title,
        category: project.category,
        githubLink: project.github_url,
        demoLink: project.demo_url,
        description: project.description,
        images: finalImages,
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

      // Close popup
      setCreateProjectOpen(false);

      // Go to Creations tab
      setActiveTab("creations");

    } catch (error) {
      console.error(
        "Unexpected error creating project:",
        error
      );
    }
  }; 

  // Save profile information to Supabase
  const handleSaveProfile = async () => {
    setProfileSaving(true);

    try {
      // Get the currently logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Could not get current user:", userError);
        return;
      }

      // This will hold the photo URL that gets saved to profiles
      let profilePhotoURL = profilePhoto;

      // Upload a new profile photo if the user selected one
      if (profilePhotoFile) {
        const fileExtension = profilePhotoFile.name
          .split(".")
          .pop();

        const fileName = `profile-${Date.now()}.${fileExtension}`;

        // Put the image inside this user's folder
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(filePath, profilePhotoFile, {
            contentType: profilePhotoFile.type,
          });

        if (uploadError) {
          console.error(
            "Error uploading profile photo:",
            uploadError
          );
          return;
        }

        // Get the public URL
        const { data: publicURLData } = supabase.storage
          .from("profile-images")
          .getPublicUrl(filePath);

        profilePhotoURL = publicURLData.publicUrl;
      }

      // Update this user's profile row
      const { data, error: profileError } = await supabase
        .from("profiles")
        .update({
          username: username.trim() || "Username",
          bio: profileBio.trim(),
          birthday: birthday || null,
          profile_photo_url: profilePhotoURL,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (profileError) {
        console.error(
          "Error updating profile:",
          profileError
        );
        return;
      }

      // Update the React state with the saved database values
      setUsername(data.username || "Username");
      setProfileBio(data.bio || "");
      setBirthday(data.birthday || "");
      setProfilePhoto(
        data.profile_photo_url || "/profile-photo.jpg"
      );

      // The file has now been uploaded
      setProfilePhotoFile(null);

      // Close the edit profile popup
      setEditProfileOpen(false);

      console.log("Profile successfully updated.");

    } catch (error) {
      console.error(
        "Unexpected error saving profile:",
        error
      );
    } finally {
      setProfileSaving(false);
    }
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
              <button type="button" onClick={handleLogout}>Logout</button>
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

          {/* Add in a loading page */}
          {profileDataLoading ? (
            <div className="empty-collection">
              <h2>Loading...</h2>
              <p>Loading your Kindling profile</p>
            </div>
          ) : (
            <>
              {activeTab === "creations" && (
                <button
                  className="create-project-card"
                  onClick={() => setCreateProjectOpen(true)}
                >
                  <span className="plus-icon">+</span>

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
                  <article
                    key={post.id}
                    className="profile-post"
                    onClick={() => setSelectedPost(post)}
                  >
                    <img
                      src={
                        post.images?.[0] ||
                        post.image ||
                        "https://images.unsplash.com/photo-1497366811353-6870744d04b2"
                      }
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
            </>
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
                src={selectedPost.images?.[0] || selectedPost.image ||
                  "https://images.unsplash.com/photo-1497366811353-6870744d04b2"
                }
                alt={selectedPost.projectName || selectedPost.title}
                className="profile-modal-image" />

              <div className="profile-modal-info">
                <span className="profile-category">
                  {selectedPost.category}
                </span>

                <h2>{selectedPost.projectName || selectedPost.title}</h2>

                {/*unsave function*/}
                {activeTab === "collections" && (
                  <button
                    type="button"
                    className="idea-save-button saved"
                    disabled={unsavingCollectionId === selectedPost.inspirationId}
                    onClick={() =>
                      handleUnsaveCollection(selectedPost.inspirationId)
                    }
                    aria-label="Unsave this idea"
                  >
                    <i className="fa-solid fa-bookmark"></i>
                    <span>save</span>
                  </button>
                )}
                
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
                onClick={handleSaveProfile} disabled={profileSaving}>
                {profileSaving? "Saving..." : "Saved Changes"}
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