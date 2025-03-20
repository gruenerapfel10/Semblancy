"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./exam-centre-finder.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faMapMarkerAlt,
  faCalendarAlt,
  faBuilding,
  faInfoCircle,
  faWheelchair,
  faParking,
  faLocationArrow,
  faFilter,
  faCompass,
  faExternalLinkAlt,
  faTimes,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ExamCentreFinder() {
  const [isLoading, setIsLoading] = useState(true);
  const [centres, setCentres] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    wheelchairAccess: false,
    parking: false,
    computerBased: false,
  });
  const [activeView, setActiveView] = useState("list"); // list or map
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [showMapPanel, setShowMapPanel] = useState(true);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  const mapContainerRef = useRef(null);
  const markersRef = useRef([]);

  // Initialize centres data with London exam centres
  useEffect(() => {
    const timer = setTimeout(() => {
      const centresData = [
        {
          id: 1,
          name: "Pearson Professional Centers-London",
          address: "190 High Holborn, London, WC1V 7BH",
          distance: 1.2,
          examsOffered: ["NCLEX", "Professional Certification", "IT Certification"],
          facilities: ["Wheelchair Access", "Computer Based Exams"],
          nextAvailable: "2025-03-25",
          location: { lat: 51.5172, lng: -0.1182 },
          description: "Administers various professional and certification exams, including the NCLEX for nursing licensure."
        },
        {
          id: 2,
          name: "Trinity SELT Stratford",
          address: "Boardman House, 64-70 Broadway, Stratford, London E15 1NG",
          distance: 3.8,
          examsOffered: ["Secure English Language Tests", "UKVI Approved Tests"],
          facilities: ["Wheelchair Access", "Computer Based Exams", "Parking"],
          nextAvailable: "2025-03-28",
          location: { lat: 51.5416, lng: -0.0019 },
          description: "Offers Secure English Language Tests (SELT) approved by the UK Home Office."
        },
        {
          id: 3,
          name: "AEC Tutors Exam Centre",
          address: "221A High Street North, East Ham, London, E6 1JG",
          distance: 6.5,
          examsOffered: ["GCSE", "A-Level", "IELTS"],
          facilities: ["Wheelchair Access", "Parking"],
          nextAvailable: "2025-04-05",
          location: { lat: 51.5396, lng: 0.0526 },
          description: "Provides facilities for GCSE, A-Level, and IELTS examinations.",
          website: "https://aectutors.co.uk"
        },
        {
          id: 4,
          name: "Exam Centre London (ECL)",
          address: "East London",
          distance: 5.1,
          examsOffered: ["GCSEs", "IGCSEs", "A-Levels"],
          facilities: ["Computer Based Exams"],
          nextAvailable: "2025-04-10",
          location: { lat: 51.5201, lng: -0.0558 },
          description: "Caters to home educators, distance learners, and independent learners.",
          website: "https://examcentrelondon.co.uk"
        },
        {
          id: 5,
          name: "Pitman Training",
          address: "Central and West London",
          distance: 3.2,
          examsOffered: ["Business Certifications", "IT Qualifications"],
          facilities: ["Wheelchair Access", "Computer Based Exams"],
          nextAvailable: "2025-03-30",
          location: { lat: 51.5155, lng: -0.1389 },
          description: "Offers various examinations and is recognized for its training programs.",
          website: "https://pitman-training.com"
        },
        {
          id: 6,
          name: "Prometric Test Center",
          address: "London",
          distance: 2.8,
          examsOffered: ["Professional Certifications", "Academic Tests"],
          facilities: ["Wheelchair Access", "Computer Based Exams", "Parking"],
          nextAvailable: "2025-03-22",
          location: { lat: 51.5074, lng: -0.1278 },
          description: "Provides industry-leading assessment design and delivery solutions."
        },
        {
          id: 7,
          name: "Kryterion Testing Center",
          address: "London",
          distance: 4.2,
          examsOffered: ["IT Certifications", "Professional Exams"],
          facilities: ["Computer Based Exams"],
          nextAvailable: "2025-04-02",
          location: { lat: 51.5113, lng: -0.1198 },
          description: "Offers a network of test centers worldwide for various certification programs."
        },
      ];

      setCentres(centresData);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (activeView !== 'map' || isLoading) return;

    // Dynamic import of Leaflet
    const initializeMap = async () => {
      // Import Leaflet dynamically
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      // Clean up previous map instance
      if (mapInstance) {
        mapInstance.remove();
      }

      // Create map only if the ref exists and Leaflet is available
      if (mapContainerRef.current && L) {
        // Set initial view to London
        const map = L.map(mapContainerRef.current).setView([51.505, -0.09], 12);

        // Add custom styled map tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
          className: isDarkTheme() ? styles.darkTiles : styles.lightTiles
        }).addTo(map);

        // Apply custom map styling
        applyMapStyling(map, L);

        // Add centre markers
        addCentreMarkers(map, L);

        // If user location exists, add marker
        if (userLocation) {
          addUserLocationMarker(map, L);
        }

        // Store map instance
        setMapInstance(map);

        // Update markers when user location changes
        map.on('moveend', () => {
          updateDistances(map);
        });
      }
    };

    initializeMap();

    return () => {
      // Clean up the map instance when component unmounts or view changes
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [activeView, isLoading, userLocation, centres]);

  // Apply custom styling to the map
  const applyMapStyling = (map, L) => {
    // Add a custom CSS class to the map container for styling
    map.getContainer().classList.add(styles.customMap);
    
    if (isDarkTheme()) {
      map.getContainer().classList.add(styles.darkTheme);
    }

    // Customize zoom controls
    const zoomControl = L.control.zoom({
      position: 'bottomright',
      zoomInText: '+',
      zoomOutText: '-',
      zoomInTitle: 'Zoom in',
      zoomOutTitle: 'Zoom out'
    });
    
    map.addControl(zoomControl);
    
    // Add custom CSS class to zoom controls
    setTimeout(() => {
      const zoomInButton = document.querySelector('.leaflet-control-zoom-in');
      const zoomOutButton = document.querySelector('.leaflet-control-zoom-out');
      
      if (zoomInButton && zoomOutButton) {
        zoomInButton.classList.add(styles.customZoomButton);
        zoomOutButton.classList.add(styles.customZoomButton);
      }
    }, 0);
  };

  // Add markers for each centre
  const addCentreMarkers = (map, L) => {
    // Clear existing markers
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => {
        marker.remove();
      });
      markersRef.current = [];
    }

    // Custom marker icon
    const customIcon = L.divIcon({
      className: styles.customMarker,
      html: `<div class="${styles.markerPin}"><span><i class="fa fa-building"></i></span></div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });

    // Add markers for each centre
    centres.forEach(centre => {
      const { location } = centre;
      
      if (location && location.lat && location.lng) {
        const marker = L.marker([location.lat, location.lng], { icon: customIcon })
          .addTo(map)
          .on('click', () => {
            setSelectedCentre(centre);
            setShowMapPanel(true);
          });
          
        // Add pulse animation class
        setTimeout(() => {
          const markerElement = marker.getElement();
          if (markerElement) {
            markerElement.classList.add(styles.pulse);
          }
        }, 100);
        
        markersRef.current.push(marker);
      }
    });

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  };

  // Add marker for user's location
  const addUserLocationMarker = (map, L) => {
    const userIcon = L.divIcon({
      className: styles.userMarker,
      html: `<div class="${styles.userPin}"><span><i class="fa fa-user"></i></span></div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup('Your Location')
      .openPopup();
    
    // Add user marker to the markers ref
    markersRef.current.push(userMarker);
    
    // Center map on user location
    map.setView([userLocation.lat, userLocation.lng], 12);
  };

  // Update distances when map moves
  const updateDistances = (map) => {
    if (!userLocation) return;
    
    const userLatLng = L.latLng(userLocation.lat, userLocation.lng);
    
    const updatedCentres = centres.map(centre => {
      if (centre.location && centre.location.lat && centre.location.lng) {
        const centreLatLng = L.latLng(centre.location.lat, centre.location.lng);
        const distanceInMeters = userLatLng.distanceTo(centreLatLng);
        const distanceInMiles = (distanceInMeters / 1609.34).toFixed(1);
        
        return {
          ...centre,
          distance: parseFloat(distanceInMiles)
        };
      }
      return centre;
    });
    
    setCentres(updatedCentres);
  };

  // Get user's current location
  const getUserLocation = () => {
    if (!userLocation && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to London center if location access is denied
          setUserLocation({ lat: 51.505, lng: -0.09 });
        }
      );
    }
  };

  // Check if dark theme is active
  const isDarkTheme = () => {
    if (typeof document !== 'undefined') {
      return document.documentElement.getAttribute('data-theme') === 'dark';
    }
    return false;
  };

  // Filter exam centres
  const filteredCentres = centres.filter((centre) => {
    const matchesSearch =
      centre.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      centre.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      centre.examsOffered.some((exam) =>
        exam.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFilters =
      (!filters.wheelchairAccess ||
        centre.facilities.includes("Wheelchair Access")) &&
      (!filters.parking || centre.facilities.includes("Parking")) &&
      (!filters.computerBased ||
        centre.facilities.includes("Computer Based Exams"));

    return matchesSearch && matchesFilters;
  });

  // Toggle filter
  const toggleFilter = (filter) => {
    setFilters({
      ...filters,
      [filter]: !filters[filter],
    });
  };

  // Facility badge with appropriate icon
  const getFacilityBadge = (facility) => {
    switch (facility) {
      case "Wheelchair Access":
        return (
          <span className={styles.facilityBadge}>
            <FontAwesomeIcon icon={faWheelchair} />
            <span>Accessible</span>
          </span>
        );
      case "Parking":
        return (
          <span className={styles.facilityBadge}>
            <FontAwesomeIcon icon={faParking} />
            <span>Parking</span>
          </span>
        );
      case "Computer Based Exams":
        return (
          <span className={styles.facilityBadge}>
            <FontAwesomeIcon icon={faBuilding} />
            <span>Computer Exams</span>
          </span>
        );
      default:
        return (
          <span className={styles.facilityBadge}>
            <FontAwesomeIcon icon={faInfoCircle} />
            <span>{facility}</span>
          </span>
        );
    }
  };

  // Format date string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Exam Centre Finder</h1>
        <p className={styles.subtitle}>
          Find examination centres near you for your upcoming exams
        </p>
      </div>

      <div className={styles.searchAndFilters}>
        <div className={styles.searchBar}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by centre name, location, or exam type..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            className={styles.locationButton}
            onClick={getUserLocation}
          >
            <FontAwesomeIcon icon={faLocationArrow} />
            <span>Near Me</span>
          </button>
        </div>

        <div className={styles.filtersContainer}>
          <div className={styles.filtersTitle}>
            <FontAwesomeIcon icon={faFilter} />
            <span>Filters:</span>
          </div>
          <div className={styles.filterOptions}>
            <button
              className={`${styles.filterButton} ${
                filters.wheelchairAccess ? styles.activeFilter : ""
              }`}
              onClick={() => toggleFilter("wheelchairAccess")}
            >
              <FontAwesomeIcon icon={faWheelchair} />
              <span>Accessible</span>
            </button>
            <button
              className={`${styles.filterButton} ${
                filters.parking ? styles.activeFilter : ""
              }`}
              onClick={() => toggleFilter("parking")}
            >
              <FontAwesomeIcon icon={faParking} />
              <span>Parking</span>
            </button>
            <button
              className={`${styles.filterButton} ${
                filters.computerBased ? styles.activeFilter : ""
              }`}
              onClick={() => toggleFilter("computerBased")}
            >
              <FontAwesomeIcon icon={faBuilding} />
              <span>Computer Exams</span>
            </button>
          </div>

          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${
                activeView === "list" ? styles.activeView : ""
              }`}
              onClick={() => setActiveView("list")}
            >
              List
            </button>
            <button
              className={`${styles.viewButton} ${
                activeView === "map" ? styles.activeView : ""
              }`}
              onClick={() => setActiveView("map")}
            >
              Map
            </button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <LoadingSpinner text="Finding exam centres near you..."/>
        ) : (
          <>
            {activeView === "list" ? (
              <div className={styles.centresList}>
                {filteredCentres.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                    </div>
                    <h3>No centres found</h3>
                    <p>Try adjusting your search criteria or filters.</p>
                  </div>
                ) : (
                  filteredCentres.map((centre) => (
                    <div key={centre.id} className={styles.centreCard}>
                      <div className={styles.centreHeader}>
                        <h3 className={styles.centreName}>{centre.name}</h3>
                        <span className={styles.centreDistance}>
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                          {centre.distance} miles away
                        </span>
                      </div>

                      <div className={styles.centreAddress}>
                        {centre.address}
                      </div>

                      <div className={styles.centreDetails}>
                        <div className={styles.examsOffered}>
                          <h4>Exams Offered:</h4>
                          <div className={styles.examTags}>
                            {centre.examsOffered.map((exam, index) => (
                              <span key={index} className={styles.examTag}>
                                {exam}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className={styles.centreFacilities}>
                          <h4>Facilities:</h4>
                          <div className={styles.facilitiesList}>
                            {centre.facilities.map((facility, index) => (
                              <div key={index}>
                                {getFacilityBadge(facility)}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className={styles.nextAvailable}>
                          <h4>Next Available Date:</h4>
                          <span className={styles.availableDate}>
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            {formatDate(centre.nextAvailable)}
                          </span>
                        </div>
                        
                        {centre.description && (
                          <div className={styles.centreDescription}>
                            <p>{centre.description}</p>
                          </div>
                        )}
                        
                        {centre.website && (
                          <div className={styles.centreWebsite}>
                            <a href={centre.website} target="_blank" rel="noopener noreferrer">
                              Visit Website <FontAwesomeIcon icon={faExternalLinkAlt} />
                            </a>
                          </div>
                        )}
                      </div>

                      <div className={styles.centreActions}>
                        <button className={styles.bookButton}>Book Exam</button>
                        <button className={styles.directionsButton}>
                          Get Directions
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className={styles.mapContainer}>
                <div 
                  ref={mapContainerRef} 
                  className={styles.mapView}
                ></div>
                
                {showMapPanel && windowWidth > 768 && (
                  <div className={styles.mapSidebar}>
                    <div className={styles.mapSidebarHeader}>
                      <h3>Exam Centres</h3>
                      <button 
                        className={styles.closeButton}
                        onClick={() => setShowMapPanel(false)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                    
                    <div className={styles.mapSidebarContent}>
                      {selectedCentre ? (
                        <div className={styles.selectedCentreDetails}>
                          <h3>{selectedCentre.name}</h3>
                          <p className={styles.selectedCentreAddress}>
                            <FontAwesomeIcon icon={faMapMarkerAlt} /> {selectedCentre.address}
                          </p>
                          <p className={styles.selectedCentreDistance}>
                            <FontAwesomeIcon icon={faCompass} /> {selectedCentre.distance} miles away
                          </p>
                          
                          <div className={styles.examsOfferedSmall}>
                            <h4>Exams Offered:</h4>
                            <div className={styles.examTagsSmall}>
                              {selectedCentre.examsOffered.map((exam, index) => (
                                <span key={index} className={styles.examTagSmall}>
                                  {exam}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className={styles.facilitiesSmall}>
                            <h4>Facilities:</h4>
                            <div className={styles.facilitiesListSmall}>
                              {selectedCentre.facilities.map((facility, index) => (
                                <div key={index}>
                                  {getFacilityBadge(facility)}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className={styles.nextAvailableSmall}>
                            <h4>Next Available:</h4>
                            <span className={styles.availableDateSmall}>
                              <FontAwesomeIcon icon={faCalendarAlt} />
                              {formatDate(selectedCentre.nextAvailable)}
                            </span>
                          </div>
                          
                          {selectedCentre.description && (
                            <p className={styles.centreDescriptionSmall}>
                              {selectedCentre.description}
                            </p>
                          )}
                          
                          <div className={styles.centreActions}>
                            <button className={styles.bookButton}>Book Exam</button>
                            <button className={styles.directionsButton}>Get Directions</button>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.mapSidebarList}>
                          <p className={styles.selectPrompt}>Select a centre on the map to view details</p>
                          
                          {filteredCentres.map(centre => (
                            <div 
                              key={centre.id} 
                              className={styles.centreListItem}
                              onClick={() => {
                                setSelectedCentre(centre);
                                if (mapInstance && centre.location) {
                                  mapInstance.setView([centre.location.lat, centre.location.lng], 14);
                                }
                              }}
                            >
                              <h4>{centre.name}</h4>
                              <p>{centre.distance} miles • {formatDate(centre.nextAvailable)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {windowWidth <= 768 && selectedCentre && (
                  <div className={styles.mobileDetailPanel}>
                    <div className={styles.mobileDetailHeader}>
                      <h3>{selectedCentre.name}</h3>
                      <button 
                        className={styles.closeButton}
                        onClick={() => setSelectedCentre(null)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                    <div className={styles.mobileDetailContent}>
                      <p><FontAwesomeIcon icon={faMapMarkerAlt} /> {selectedCentre.address}</p>
                      <p>{selectedCentre.distance} miles away • Next available: {formatDate(selectedCentre.nextAvailable)}</p>
                      <div className={styles.mobileActions}>
                        <button className={styles.bookButton}>Book Exam</button>
                        <button className={styles.directionsButton}>Directions</button>
                      </div>
                    </div>
                  </div>
                )}
                
                {!showMapPanel && windowWidth > 768 && (
                  <button 
                    className={styles.expandButton}
                    onClick={() => setShowMapPanel(true)}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}