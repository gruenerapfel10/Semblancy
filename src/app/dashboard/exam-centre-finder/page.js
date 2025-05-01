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
  faPhone,
  faEnvelope,
  faGlobe,
  faArrowUp,
  faClock
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "@/components/LoadingSpinner";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";

export default function ExamCentreFinder() {
  const [isLoading, setIsLoading] = useState(true);
  const [centres, setCentres] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    wheelchairAccess: false,
    parking: false,
    computerBased: false,
  });
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [map, setMap] = useState(null);
  const [mapCenter, setMapCenter] = useState({
    lat: 51.5074,
    lng: -0.1278
  });
  const [mapStyles, setMapStyles] = useState([]);

  const mapRef = useRef(null);
  const sidebarRef = useRef(null);
  const modalRef = useRef(null);

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyDMzIzgHED0mG_6RXJRQqmG2I5DaP_rTUQ", // Replace with your API key
  });

  // Map container style
  const mapContainerStyle = {
    width: '100%',
    height: '100%',
  };

  // Default map center (London)
  const defaultCenter = {
    lat: 51.5074,
    lng: -0.1278
  };

  // Initialize centres data with London exam centres
  useEffect(() => {
    const timer = setTimeout(() => {
      const centresData = [
        {
          id: 1,
          name: "Pearson Professional Centers",
          address: "190 High Holborn, London, WC1V 7BH",
          distance: 1.2,
          examsOffered: ["NCLEX", "Professional Certification", "IT Certification"],
          facilities: ["Wheelchair Access", "Computer Based Exams"],
          nextAvailable: "2025-03-25",
          location: { lat: 51.5172, lng: -0.1182 },
          description: "Administers various professional and certification exams, including the NCLEX for nursing licensure.",
          phone: "+44 20 7123 4567",
          email: "pearson.london@example.com",
          website: "https://pearsonvue.com",
          openingHours: "Mon-Fri: 8:00-18:00, Sat: 9:00-15:00",
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
          description: "Offers Secure English Language Tests (SELT) approved by the UK Home Office.",
          phone: "+44 20 8234 5678",
          email: "trinity.stratford@example.com",
          website: "https://trinitycollege.com/selt",
          openingHours: "Mon-Fri: 9:00-17:00",
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
          phone: "+44 20 8345 6789",
          email: "info@aectutors.co.uk",
          website: "https://aectutors.co.uk",
          openingHours: "Mon-Fri: 9:00-18:00, Sat: 10:00-15:00",
        },
        {
          id: 4,
          name: "Exam Centre London (ECL)",
          address: "132 Commercial Road, London E1 1NJ",
          distance: 5.1,
          examsOffered: ["GCSEs", "IGCSEs", "A-Levels"],
          facilities: ["Computer Based Exams"],
          nextAvailable: "2025-04-10",
          location: { lat: 51.5147, lng: -0.0668 },
          description: "Caters to home educators, distance learners, and independent learners.",
          phone: "+44 20 7456 7890",
          email: "contact@examcentrelondon.co.uk",
          website: "https://examcentrelondon.co.uk",
          openingHours: "Mon-Sat: 9:00-17:00",
        },
        {
          id: 5,
          name: "Pitman Training",
          address: "Aldwych House, 71-91 Aldwych, London WC2B 4HN",
          distance: 3.2,
          examsOffered: ["Business Certifications", "IT Qualifications"],
          facilities: ["Wheelchair Access", "Computer Based Exams"],
          nextAvailable: "2025-03-30",
          location: { lat: 51.5128, lng: -0.1174 },
          description: "Offers various examinations and is recognized for its training programs.",
          phone: "+44 20 7567 8901",
          email: "london@pitman-training.com",
          website: "https://pitman-training.com",
          openingHours: "Mon-Fri: 8:30-18:00",
        },
        {
          id: 6,
          name: "Prometric Test Center",
          address: "50 Victoria Embankment, London EC4Y 0DZ",
          distance: 2.8,
          examsOffered: ["Professional Certifications", "Academic Tests"],
          facilities: ["Wheelchair Access", "Computer Based Exams", "Parking"],
          nextAvailable: "2025-03-22",
          location: { lat: 51.5114, lng: -0.1058 },
          description: "Provides industry-leading assessment design and delivery solutions.",
          phone: "+44 20 8678 9012",
          email: "london@prometric.com",
          website: "https://prometric.com",
          openingHours: "Mon-Fri: 8:00-17:30",
        },
        {
          id: 7,
          name: "Kryterion Testing Center",
          address: "100 New Oxford Street, London WC1A 1HB",
          distance: 4.2,
          examsOffered: ["IT Certifications", "Professional Exams"],
          facilities: ["Computer Based Exams"],
          nextAvailable: "2025-04-02",
          location: { lat: 51.5168, lng: -0.1277 },
          description: "Offers a network of test centers worldwide for various certification programs.",
          phone: "+44 20 7789 0123",
          email: "support@kryterion.co.uk",
          website: "https://kryterion.com",
          openingHours: "Mon-Fri: 9:00-17:00",
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
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call once on mount to set initial state
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle user location
  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
          
          // Center map on user location if map is available
          if (map) {
            map.panTo(location);
            map.setZoom(13);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to London center if location access is denied
          setUserLocation(defaultCenter);
          setMapCenter(defaultCenter);
        }
      );
    }
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

  // Update map styles when theme changes
  useEffect(() => {
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    setMapStyles(isDarkTheme ? darkMapStyles : []);
    
    // If map is loaded, update its styles
    if (map) {
      map.setOptions({
        styles: isDarkTheme ? darkMapStyles : []
      });
    }
  }, [map, document.documentElement.getAttribute('data-theme')]);

  // Custom map style for dark mode
  const darkMapStyles = [
    {
      featureType: "all",
      elementType: "geometry",
      stylers: [{ color: "#242f3e" }]
    },
    {
      featureType: "all",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#242f3e" }, { lightness: 10 }]
    },
    {
      featureType: "all",
      elementType: "labels.text.fill",
      stylers: [{ color: "#746855" }]
    },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }]
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }]
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }]
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }]
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }]
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }]
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }]
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }]
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }]
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }]
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }]
    }
  ];

  // Handle map load
  const onMapLoad = (map) => {
    mapRef.current = map;
    setMap(map);
  };

  // Center map on a specific centre
  const centerOnCentre = (centre) => {
    if (map && centre && centre.location) {
      map.panTo(centre.location);
      map.setZoom(15);
      setMapCenter(centre.location);
      setSelectedCentre(centre);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.mapContainer}>
        {/* Main Map Section */}
        <div className={styles.mapWrapper}>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={12}
              options={{
                styles: mapStyles,
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: true,
                fullscreenControl: false,
              }}
              onLoad={onMapLoad}
            >
              {/* User location marker */}
              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={{
                    path: 0, // Circle path
                    fillColor: '#4285F4',
                    fillOpacity: 1,
                    scale: 8,
                    strokeColor: 'white',
                    strokeWeight: 2,
                  }}
                />
              )}
              
              {/* Centre markers */}
              {filteredCentres.map((centre) => (
                <Marker
                  key={centre.id}
                  position={centre.location}
                  onClick={() => setSelectedCentre(centre)}
                  icon={{
                    url: `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48"><path fill="%230046FF" d="M18 0c-9.941 0-18 8.059-18 18 0 14.332 18 30 18 30s18-15.668 18-30c0-9.941-8.059-18-18-18zm0 24c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z"/></svg>`,
                    scaledSize: new window.google.maps.Size(36, 48),
                    origin: new window.google.maps.Point(0, 0),
                    anchor: new window.google.maps.Point(18, 48),
                  }}
                  animation={window.google.maps.Animation.DROP}
                />
              ))}
              
              {/* Info window for selected centre */}
              {selectedCentre && (
                <InfoWindow
                  position={selectedCentre.location}
                  onCloseClick={() => setSelectedCentre(null)}
                >
                  <div className={styles.infoWindow}>
                    <h3 className={styles.infoWindowTitle}>{selectedCentre.name}</h3>
                    <p className={styles.infoWindowAddress}>{selectedCentre.address}</p>
                    <p className={styles.infoWindowDetails}>
                      <span className={styles.infoWindowAvailable}>
                        <FontAwesomeIcon icon={faCalendarAlt} /> Next available: {formatDate(selectedCentre.nextAvailable)}
                      </span>
                    </p>
                    <button 
                      className={styles.infoWindowButton}
                      onClick={() => setShowModal(true)}
                    >
                      View Details
                    </button>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          ) : (
            <div className={styles.loadingContainer}>
              <LoadingSpinner text="Loading map..." />
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className={`${styles.sidebar} ${showSidebar ? styles.sidebarOpen : ''}`} ref={sidebarRef}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitleContainer}>
              <h1 className={styles.sidebarTitle}>Exam Centre Finder</h1>
              <p className={styles.sidebarSubtitle}>
                Find examination centres near you
              </p>
            </div>
            
            {windowWidth <= 768 && (
              <button 
                className={styles.sidebarCloseButton}
                onClick={() => setShowSidebar(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
          
          <div className={styles.searchContainer}>
            <div className={styles.searchBar}>
              <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by name, location, or exam..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
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
          </div>
          
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
                <div 
                  key={centre.id} 
                  className={`${styles.centreCard} ${selectedCentre?.id === centre.id ? styles.selectedCard : ''}`}
                  onClick={() => {
                    centerOnCentre(centre);
                  }}
                >
                  <div className={styles.centreHeader}>
                    <h3 className={styles.centreName}>{centre.name}</h3>
                    <span className={styles.centreDistance}>
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      {centre.distance} miles
                    </span>
                  </div>
                  
                  <div className={styles.centreAddress}>
                    {centre.address}
                  </div>
                  
                  <div className={styles.centreDetails}>
                    <div className={styles.nextAvailableDate}>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>{formatDate(centre.nextAvailable)}</span>
                    </div>
                    
                    <div className={styles.facilitiesList}>
                      {centre.facilities.map((facility, index) => (
                        <div key={index}>
                          {getFacilityBadge(facility)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Mobile toggle button */}
        {windowWidth <= 768 && !showSidebar && (
          <button 
            className={styles.sidebarToggleButton}
            onClick={() => setShowSidebar(true)}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        )}
      </div>
      
      {/* Modal for detailed view */}
      {showModal && selectedCentre && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.examCentreModal} onClick={(e) => e.stopPropagation()} ref={modalRef}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{selectedCentre.name}</h3>
              <button onClick={() => setShowModal(false)} className={styles.modalClose}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.modalSection}>
                <div className={styles.modalLocationInfo}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.modalIcon} />
                  <p>{selectedCentre.address}</p>
                </div>
                <div className={styles.modalDistanceInfo}>
                  <FontAwesomeIcon icon={faCompass} className={styles.modalIcon} />
                  <p>{selectedCentre.distance} miles away</p>
                </div>
              </div>
              
              <div className={styles.modalDivider}></div>
              
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>
                  <FontAwesomeIcon icon={faCalendarAlt} className={styles.modalIcon} />
                  Next Available
                </h4>
                <p className={styles.nextAvailableDate}>{formatDate(selectedCentre.nextAvailable)}</p>
              </div>
              
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>
                  <FontAwesomeIcon icon={faClock} className={styles.modalIcon} />
                  Opening Hours
                </h4>
                <p>{selectedCentre.openingHours}</p>
              </div>
              
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>
                  Exams Offered
                </h4>
                <div className={styles.examTagsContainer}>
                  {selectedCentre.examsOffered.map((exam, index) => (
                    <span key={index} className={styles.examTag}>
                      {exam}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>Facilities</h4>
                <div className={styles.facilitiesContainer}>
                  {selectedCentre.facilities.map((facility, index) => (
                    <div key={index} className={styles.facilityBadgeContainer}>
                      {getFacilityBadge(facility)}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={styles.modalDivider}></div>
              
              <div className={styles.modalSection}>
                <p className={styles.modalDescription}>{selectedCentre.description}</p>
              </div>
              
              <div className={styles.modalContactSection}>
                {selectedCentre.phone && (
                  <a href={`tel:${selectedCentre.phone}`} className={styles.contactButton}>
                    <FontAwesomeIcon icon={faPhone} />
                    <span>Call</span>
                  </a>
                )}
                {selectedCentre.email && (
                  <a href={`mailto:${selectedCentre.email}`} className={styles.contactButton}>
                    <FontAwesomeIcon icon={faEnvelope} />
                    <span>Email</span>
                  </a>
                )}
                {selectedCentre.website && (
                  <a href={selectedCentre.website} target="_blank" rel="noopener noreferrer" className={styles.contactButton}>
                    <FontAwesomeIcon icon={faGlobe} />
                    <span>Website</span>
                  </a>
                )}
              </div>
            </div>
            
            <div className={styles.modalActions}>
              <button className={styles.actionButton}>
                <span>Book Exam</span>
                <FontAwesomeIcon icon={faArrowUp} />
              </button>
              <button className={styles.secondaryActionButton}>
                <span>Get Directions</span>
                <FontAwesomeIcon icon={faLocationArrow} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}