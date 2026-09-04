 import { useEffect, useState } from "react";
import "./App.css";
import Login from "./Login";

function App() {
  // =====================================================
  // LOGIN
  // =====================================================

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("userId")
  );

  // =====================================================
  // RESOURCES
  // =====================================================

  const [resources, setResources] = useState([]);
  const [allResources, setAllResources] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedResource, setSelectedResource] = useState(null);

  // =====================================================
  // SEARCH + CATEGORY
  // =====================================================

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Books",
    "Electronics",
    "Furniture",
    "Stationery",
    "Notes",
    "Hostel Items",
  ];

  // =====================================================
  // LIST RESOURCE
  // =====================================================

  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Books",
    price: "",
  });

  // =====================================================
  // GET ALL RESOURCES
  // =====================================================

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "https://campusreuse.onrender.com//api/resources"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch resources");
      }

      const data = await response.json();

      console.log("All resources:", data);

      setResources(data);
      setAllResources(data);
    } catch (err) {
      console.error("Fetch resources error:", err);

      setError(
        "Could not connect to the backend. Make sure your backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD RESOURCES
  // =====================================================

  useEffect(() => {
    if (isLoggedIn) {
      fetchResources();
    }
  }, [isLoggedIn]);

  // =====================================================
  // FORM INPUT
  // =====================================================

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // GET LOGGED-IN USER ID
  // =====================================================

  const getSellerId = () => {
    let sellerId = null;

    // ---------------------------------------------------
    // 1. CHECK LOCAL STORAGE
    // ---------------------------------------------------

    const possibleKeys = [
      "userId",
      "user_id",
      "sellerId",
      "seller_id",
      "id",
      "_id",
    ];

    for (const key of possibleKeys) {
      const value = localStorage.getItem(key);

      if (
        value &&
        value !== "null" &&
        value !== "undefined"
      ) {
        sellerId = value;
        break;
      }
    }

    // ---------------------------------------------------
    // 2. CHECK USER OBJECT
    // ---------------------------------------------------

    if (!sellerId) {
      const userKeys = [
        "user",
        "currentUser",
        "loggedInUser",
        "authUser",
      ];

      for (const key of userKeys) {
        const savedUser = localStorage.getItem(key);

        if (!savedUser) continue;

        try {
          const user = JSON.parse(savedUser);

          sellerId =
            user?._id ||
            user?.id ||
            user?.userId ||
            user?.user?._id ||
            user?.user?.id;

          if (sellerId) {
            break;
          }
        } catch (err) {
          console.error(
            "Could not parse saved user:",
            err
          );
        }
      }
    }

    // ---------------------------------------------------
    // 3. CHECK JWT TOKEN
    // ---------------------------------------------------

    if (!sellerId) {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const payload = JSON.parse(
            atob(token.split(".")[1])
          );

          sellerId =
            payload?._id ||
            payload?.id ||
            payload?.userId ||
            payload?.user_id;

          console.log(
            "User ID found inside token:",
            sellerId
          );
        } catch (err) {
          console.log(
            "Token does not contain readable user ID."
          );
        }
      }
    }

    // ---------------------------------------------------
    // 4. CHECK SESSION STORAGE
    // ---------------------------------------------------

    if (!sellerId) {
      for (const key of possibleKeys) {
        const value = sessionStorage.getItem(key);

        if (
          value &&
          value !== "null" &&
          value !== "undefined"
        ) {
          sellerId = value;
          break;
        }
      }
    }

    // ---------------------------------------------------
    // DEBUG
    // ---------------------------------------------------

    console.log("================================");
    console.log("Seller ID found:", sellerId);
    console.log("================================");

    return sellerId;
  };

  // =====================================================
  // SUBMIT RESOURCE
  // =====================================================

  const handleSubmitResource = (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setFormLoading(true);

    // ---------------------------------------------------
    // VALIDATE TITLE
    // ---------------------------------------------------

    if (!formData.title.trim()) {
      setError("Please enter a resource title.");
      setFormLoading(false);
      return;
    }

    // ---------------------------------------------------
    // VALIDATE DESCRIPTION
    // ---------------------------------------------------

    if (!formData.description.trim()) {
      setError("Please enter a description.");
      setFormLoading(false);
      return;
    }

    // ---------------------------------------------------
    // VALIDATE PRICE
    // ---------------------------------------------------

    if (
      formData.price === "" ||
      Number(formData.price) < 0
    ) {
      setError("Please enter a valid price.");
      setFormLoading(false);
      return;
    }

    // ---------------------------------------------------
    // GET SELLER ID
    // ---------------------------------------------------

    const sellerId = getSellerId();

    if (!sellerId) {
      setError(
        "You must be logged in before listing a resource."
      );

      setFormLoading(false);
      return;
    }

    // ---------------------------------------------------
    // CHECK GEOLOCATION
    // ---------------------------------------------------

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );

      setFormLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const longitude =
          position.coords.longitude;

        const latitude =
          position.coords.latitude;

        console.log(
          "Resource Latitude:",
          latitude
        );

        console.log(
          "Resource Longitude:",
          longitude
        );

        // -------------------------------------------------
        // RESOURCE DATA
        // -------------------------------------------------

        const resourceData = {
          title: formData.title.trim(),

          description:
            formData.description.trim(),

          category: formData.category,

          price: Number(formData.price),

          seller: sellerId,

          location: {
            type: "Point",

            coordinates: [
              longitude,
              latitude,
            ],
          },
        };

        console.log(
          "Sending resource:",
          resourceData
        );

        try {
          // -----------------------------------------------
          // POST RESOURCE
          // -----------------------------------------------

          const response = await fetch(
            " https://campusreuse.onrender.com/api/resources",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify(
                resourceData
              ),
            }
          );

          const data =
            await response.json();

          console.log(
            "Backend response:",
            data
          );

          // -----------------------------------------------
          // BACKEND ERROR
          // -----------------------------------------------

          if (!response.ok) {
            throw new Error(
              data.error ||
                data.message ||
                "Failed to create resource"
            );
          }

          // -----------------------------------------------
          // SUCCESS
          // -----------------------------------------------

          setSuccess(
            "Resource listed successfully! 🎉"
          );

          // -----------------------------------------------
          // CLEAR FORM
          // -----------------------------------------------

          setFormData({
            title: "",
            description: "",
            category: "Books",
            price: "",
          });

          // -----------------------------------------------
          // REFRESH RESOURCES
          // -----------------------------------------------

          await fetchResources();

          // -----------------------------------------------
          // CLOSE FORM
          // -----------------------------------------------

          setTimeout(() => {
            setShowForm(false);
            setSuccess("");
            setError("");
          }, 1500);
        } catch (err) {
          console.error(
            "Resource listing error:",
            err
          );

          setError(
            err.message ||
              "Failed to list resource."
          );
        } finally {
          setFormLoading(false);
        }
      },

      // ---------------------------------------------------
      // GEOLOCATION ERROR
      // ---------------------------------------------------

      (geoError) => {
        console.error(
          "Geolocation error:",
          geoError
        );

        setError(
          "Please allow location access to list your resource."
        );

        setFormLoading(false);
      }
    );
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = (event) => {
    const value =
      event.target.value.toLowerCase();

    setSearch(value);

    const filtered =
      allResources.filter(
        (resource) => {
          const title =
            resource.title?.toLowerCase() ||
            "";

          const description =
            resource.description?.toLowerCase() ||
            "";

          const category =
            resource.category?.toLowerCase() ||
            "";

          return (
            title.includes(value) ||
            description.includes(value) ||
            category.includes(value)
          );
        }
      );

    setResources(filtered);
  };

  // =====================================================
  // CATEGORY
  // =====================================================

  const handleCategory = (category) => {
    setSelectedCategory(category);

    setSearch("");

    if (category === "All") {
      setResources(allResources);
      return;
    }

    const filtered =
      allResources.filter(
        (resource) =>
          resource.category?.toLowerCase() ===
          category.toLowerCase()
      );

    setResources(filtered);
  };

  // =====================================================
  // LOGIN SCREEN
  // =====================================================

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() => {
          setIsLoggedIn(true);
        }}
      />
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="app">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="navbar">

        <div>
          <h1>
            🎓 CampusReuse
          </h1>

          <p>
            Reuse • Share • Save
          </p>
        </div>

        <button
          className="list-button"
          onClick={() => {
            setShowForm(true);
            setError("");
            setSuccess("");
          }}
        >
          + List Resource
        </button>

      </header>

      {/* =================================================
          HERO
      ================================================= */}

      <section className="hero">

        <div>

          <h2>
            Find what you need on campus.
          </h2>

          <p>
            Buy, sell, share and reuse
            resources within your campus
            community.
          </p>

          <div className="search-box">

            <span>
              🔍
            </span>

            <input
              type="text"
              placeholder="Search books, electronics, notes..."
              value={search}
              onChange={handleSearch}
            />

          </div>

        </div>

      </section>

      <main>

        {/* =================================================
            CATEGORIES
        ================================================= */}

        <section className="categories">

          <h2>
            Browse Categories
          </h2>

          <div className="category-list">

            {categories.map(
              (category) => (

                <button
                  key={category}
                  className={
                    selectedCategory ===
                    category
                      ? "category active"
                      : "category"
                  }
                  onClick={() =>
                    handleCategory(
                      category
                    )
                  }
                >
                  {category}
                </button>

              )
            )}

          </div>

        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="message error">
            ❌ {error}
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="message success">
            ✅ {success}
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="message">
            ⏳ Loading resources...
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          !error &&
          resources.length === 0 && (

            <div className="message empty">

              <h3>
                📭 No resources found
              </h3>

              <p>
                Try another search or
                category.
              </p>

            </div>

          )}

        {/* =================================================
            RESOURCE CARDS
        ================================================= */}

        {!loading &&
          resources.length > 0 && (

            <section className="resources-section">

              <div className="section-title">

                <h2>
                  Available Resources
                </h2>

                <span>
                  {resources.length} resources
                </span>

              </div>

              <div className="resource-grid">

                {resources.map(
                  (resource) => (

                    <div
                      className="resource-card"
                      key={resource._id}
                    >

                      <div className="resource-icon">
                        📦
                      </div>

                      <div className="resource-content">

                        <span className="resource-category">
                          {resource.category ||
                            "Other"}
                        </span>

                        <h3>
                          {resource.title}
                        </h3>

                        <p className="description">
                          {resource.description ||
                            "No description available."}
                        </p>

                        <div className="resource-info">

                          <span>
                            💰 ₹
                            {resource.price}
                          </span>

                          <span>
                            👤{" "}
                            {resource.seller
                              ? resource.seller.name
                              : "Unknown seller"}
                          </span>

                        </div>

                        {/* VIEW DETAILS */}

                        <button
                          className="details-button"
                          onClick={() => {
                            console.log(
                              "SELECTED RESOURCE:",
                              resource
                            );

                            setSelectedResource(
                              resource
                            );
                          }}
                        >
                          View Details →
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            </section>

          )}

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>

        <h3>
          🎓 CampusReuse
        </h3>

        <p>
          Making campus life more
          affordable through reuse and
          sharing.
        </p>

      </footer>

      {/* =================================================
          RESOURCE DETAILS MODAL
      ================================================= */}

      {selectedResource && (
        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedResource(null)
          }
        >

          <div
            className="resource-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="close-button"
              onClick={() =>
                setSelectedResource(null)
              }
            >
              ✕
            </button>

            <span className="resource-category">
              {selectedResource.category ||
                "Other"}
            </span>

            <h2>
              {selectedResource.title}
            </h2>

            <p>
              {selectedResource.description ||
                "No description available."}
            </p>

            <div className="resource-info">

              <span>
                💰 ₹{selectedResource.price}
              </span>

               <div>
  <div>
    👤{" "}
    {selectedResource.seller?.name ||
      "Unknown seller"}
  </div>

  <div>
    📧{" "}
    {selectedResource.seller?.email ||
      "Email not available"}
  </div>

  <div>
    📱{" "}
    {selectedResource.seller?.phone ||
      "Phone not available"}
  </div>
</div>

            </div>

            <div className="modal-actions">

              <button
                className="submit-resource"
                 onClick={() => {
  const email = selectedResource.seller?.email;

  if (email) {
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`,
      "_blank"
    );
  } else {
    alert(
      "Seller contact information is not available for this resource."
    );
  }
}}
              >
                📩 Contact Seller
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          LIST RESOURCE MODAL
      ================================================= */}

      {showForm && (

        <div
          className="modal-overlay"
          onClick={() => {

            if (!formLoading) {

              setShowForm(false);
              setError("");
              setSuccess("");

            }

          }}
        >

          <div
            className="resource-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* CLOSE */}

            <button
              className="close-button"
              onClick={() => {

                if (!formLoading) {

                  setShowForm(false);
                  setError("");
                  setSuccess("");

                }

              }}
            >
              ✕
            </button>

            <h2>
              List a Resource
            </h2>

            <p className="modal-subtitle">
              Share something useful with
              your campus community.
            </p>

            <form
              onSubmit={
                handleSubmitResource
              }
            >

              {/* TITLE */}

              <label>
                Resource Title
              </label>

              <input
                type="text"
                name="title"
                placeholder="Example: Engineering Mathematics Book"
                value={formData.title}
                onChange={
                  handleFormChange
                }
                required
              />

              {/* DESCRIPTION */}

              <label>
                Description
              </label>

              <textarea
                name="description"
                placeholder="Describe your resource..."
                value={
                  formData.description
                }
                onChange={
                  handleFormChange
                }
                rows="4"
                required
              />

              {/* CATEGORY */}

              <label>
                Category
              </label>

              <select
                name="category"
                value={
                  formData.category
                }
                onChange={
                  handleFormChange
                }
                required
              >

                <option value="Books">
                  Books
                </option>

                <option value="Electronics">
                  Electronics
                </option>

                <option value="Furniture">
                  Furniture
                </option>

                <option value="Stationery">
                  Stationery
                </option>

                <option value="Notes">
                  Notes
                </option>

                <option value="Hostel Items">
                  Hostel Items
                </option>

              </select>

              {/* PRICE */}

              <label>
                Price (₹)
              </label>

              <input
                type="number"
                name="price"
                placeholder="Example: 250"
                min="0"
                value={
                  formData.price
                }
                onChange={
                  handleFormChange
                }
                required
              />

              {/* FORM SUCCESS */}

              {success && (
                <div className="form-success">
                  ✅ {success}
                </div>
              )}

              {/* FORM ERROR */}

              {error && (
                <div className="form-error">
                  ❌ {error}
                </div>
              )}

              {/* SUBMIT */}

              <button
                type="submit"
                className="submit-resource"
                disabled={
                  formLoading
                }
              >
                {formLoading
                  ? "Listing Resource..."
                  : "List Resource"}
              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;