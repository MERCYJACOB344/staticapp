import React, { useState, useEffect, useRef } from "react";
import { Button, Row, Col, Card, Alert } from "react-bootstrap";
import GoogleMapReact from "google-map-react";
import { convertToDms } from "../../lib/commonLib";
import OverlayScrollbars from "overlayscrollbars";
import { useSelector } from "react-redux";
import { useAppContext } from "../../lib/contextLib";
import { checkForValidSession } from "../../lib/commonLib";

function getFcrMapOptions(maps) {
  return {
    streetViewControl: false,
    scaleControl: true,
    styles: [
      {
        featureType: "poi.business",
        elementType: "labels",
        stylers: [
          {
            visibility: "off",
          },
        ],
      },
    ],
    gestureHandling: "greedy",
    disableDoubleClickZoom: true,
    mapTypeId: maps.MapTypeId.ROADMAP,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: maps.ControlPosition.BOTTOM_CENTER,
      mapTypeIds: [
        maps.MapTypeId.ROADMAP,
        maps.MapTypeId.SATELLITE,
        maps.MapTypeId.HYBRID,
      ],
    },
    zoomControl: true,
    clickableIcons: false,
  };
}

const GisDefault = () => {
  const { isAuthenticated } = useAppContext();
  const [projects, setProjects] = useState([]);
  const [dismissingAlertShow, setDismissingAlertShow] = useState(false);
  const [alertVariant, setalertVariant] = useState("");
  const [alertMessage, setalertMessage] = useState("");
  //const projects = useSelector((state) => state.projects.projects);

  const [mapZoom, setMapZoom] = useState(5);
  const [mapCenter, setMapCenter] = useState({ lat: 39, lng: -95 });

  let geocoder = null;
  let marker = null;

  const [mapG, setMapG] = useState(null);
  const [googleMap, setGoogleMap] = useState(null);
  const [gmarkers, setGmarkers] = useState([]);

  if (!isAuthenticated) {
    checkForValidSession();
  }
  const showMessage = (strMsg, msgType = "info") => {
    setalertVariant(msgType);
    setalertMessage(strMsg);
  };
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/getAllWorkOrders");
        const projects = await response.json();
        setProjects(projects);
      } catch (error) {
        setalertVariant("danger");
        setalertMessage(`Unable to get data. Please try again later.`, error);
        setDismissingAlertShow(true);
        console.error("Error fetching work orders:", error);
      }
    
    };

    fetchProjects();
  }, []);

  function geocode(request, maps, map) {
    geocoder
      .geocode(request)
      .then((result) => {
        const { results } = result;

        map.setCenter(results[0].geometry.location);

        if (!marker) {
          marker = new maps.Marker({
            position: mapCenter,
            map,
          });
        }

        marker.setPosition(results[0].geometry.location);
        marker.setMap(map);
        return results;
      })
      .catch((e) => {
        if (e.code === "ZERO_RESULTS") {
          alert("The searched location is not found");
        } else {
          alert("Geocode was not successful for the following reason: " + e);
        }
      });
  }

  function clear() {
    marker?.setMap(null);
  }
  function convertoUSDate(strVal) {
    let usDate = new Date(strVal).toLocaleString("en-US").split(",")[0];
    if (usDate === "Invalid Date") {
      usDate = "";
    }
    return usDate;
  }
  function clearFCRMarkes() {
    for (let i = 0; i < gmarkers.length; i++) {
      gmarkers[i].setMap(null);
    }
    gmarkers.splice(0, gmarkers.length);
  }

  //   create legend

  const createLegend = () => {
    const legend = document.createElement("div");
    legend.className = "legend";

    const legendHeading = document.createElement("h3");
    legendHeading.className = "legend-heading";
    legendHeading.textContent = "Project Status";
    legend.appendChild(legendHeading);

    const legendItemApproved = document.createElement("div");
    legendItemApproved.className = "legend-item";
    const legendImgApproved = document.createElement("img");
    legendImgApproved.src = "../../../img/pdfimage/checked.png";
    const legendLabelApproved = document.createElement("div");
    legendLabelApproved.className = "legend-label";
    legendLabelApproved.textContent = " Completed";

    legendItemApproved.appendChild(legendImgApproved);
    legendItemApproved.appendChild(legendLabelApproved);

    const legendItemPending = document.createElement("div");
    legendItemPending.className = "legend-item";
    const legendImgPending = document.createElement("img");
    legendImgPending.src = "../../../img/pdfimage/denied.png";
    const legendLabelPending = document.createElement("div");
    legendLabelPending.className = "legend-label";
    legendLabelPending.textContent = " QA/QC";

    legendItemPending.appendChild(legendImgPending);
    legendItemPending.appendChild(legendLabelPending);

    const legendItemCancelled = document.createElement("div");
    legendItemCancelled.className = "legend-item";
    const legendImgCancelled = document.createElement("img");
    legendImgCancelled.src = "../../../img/pdfimage/submit.png";
    const legendLabelCancelled = document.createElement("div");
    legendLabelCancelled.className = "legend-label";
    legendLabelCancelled.textContent = " Submitted Request";

    legendItemCancelled.appendChild(legendImgCancelled);
    legendItemCancelled.appendChild(legendLabelCancelled);

    const legendItemInProgress = document.createElement("div");
    legendItemInProgress.className = "legend-item";
    const legendImgInProgress = document.createElement("img");
    legendImgInProgress.src = "../../../img/pdfimage/on-progress.png";
    const legendLabelInProgress = document.createElement("div");
    legendLabelInProgress.className = "legend-label";
    legendLabelInProgress.textContent = " InProgress";

    legendItemInProgress.appendChild(legendImgInProgress);
    legendItemInProgress.appendChild(legendLabelInProgress);

    legend.appendChild(legendItemApproved);
    legend.appendChild(legendItemPending);
    legend.appendChild(legendItemCancelled);
    legend.appendChild(legendItemInProgress);

    return legend;
  };

  function handleApiLoaded(map, maps) {
    setMapG(map);
    setGoogleMap(maps);
    geocoder = new google.maps.Geocoder();

    const inputText = document.createElement("input");
    const legend = createLegend();

    inputText.type = "text";
    inputText.placeholder = "Enter a location";
    inputText.className = "gmapSearchText";
    const autocomplete = new google.maps.places.Autocomplete(inputText, {
      componentRestrictions: { country: "us" },
      // maxResults: 3,
    });
    // autocomplete.addListener('place_changed', () => {
    //   const place = autocomplete.getPlace();
    //   if (place.formatted_address) {
    //     geocode({ address: place.formatted_address }, maps, map);
    //   }
    // });

    const submitButton = document.createElement("input");
    submitButton.type = "button";
    submitButton.value = "Locate";
    submitButton.className = "gmapSearchButton";
    submitButton.classList.add("button", "button-primary");

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(inputText);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(submitButton);
    map.controls[maps.ControlPosition.RIGHT_TOP].push(legend);

    submitButton.addEventListener("click", () =>
      geocode({ address: inputText.value }, maps, map)
    );
  }
  function getCordinates(project) {
    let coordinates = {};
    if (project.lat_long) {
      const [lat, lng] = project.lat_long.split(",").map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        coordinates = {
          lat: lat,
          lng: lng,
        };
      }
    }
    return coordinates;
  }

  function getProjectCordinates(projects) {
    let allRequestCoordinates = [];

    for (let i = 0; i < projects.length; i++) {
      let projectObj = {
        projectName: projects[i].project_name,
        status: projects[i].status,
        coordinates: getCordinates(projects[i]),
      };
      allRequestCoordinates.push(projectObj);
    }

    return allRequestCoordinates;
  }
  const containerRef = useRef(null);

  useEffect(() => {
    if (!googleMap) {
      return;
    }

    let projectDtas = getProjectCordinates(projects);

    let projectCordinates = projectDtas.filter(
      (project) =>
        project.coordinates && Object.keys(project.coordinates).length > 0
    );

    // calculating distance between coordinates
    const toRadians = (value) => {
      return (value * Math.PI) / 180;
    };

    const getDistance = (coord1, coord2) => {
      const earthRadius = 6371; // Radius of the earth in km
      const latDiff = toRadians(coord2.lat - coord1.lat);
      const lngDiff = toRadians(coord2.lng - coord1.lng);

      const latLng =
        Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
        Math.cos(toRadians(coord1.lat)) *
          Math.cos(toRadians(coord2.lat)) *
          Math.sin(lngDiff / 2) *
          Math.sin(lngDiff / 2);

      const coord = 2 * Math.atan2(Math.sqrt(latLng), Math.sqrt(1 - latLng));
      const distance = earthRadius * coord;

      return distance;
    };

    // seprating zero distance cordinates to an array
    const equalFCRCoordinates = [];
    if (projectCordinates.length !== 0) {
      for (let i = 0; i < projectCordinates.length - 1; i++) {
        for (let j = i + 1; j < projectCordinates.length; j++) {
          const distanceBetweenFCRCoordinates = getDistance(
            projectCordinates[i].coordinates,
            projectCordinates[j].coordinates
          );
          if (distanceBetweenFCRCoordinates === 0) {
            if (!equalFCRCoordinates.includes(projectCordinates[i])) {
              equalFCRCoordinates.push(projectCordinates[i]);
            }
            if (!equalFCRCoordinates.includes(projectCordinates[j])) {
              equalFCRCoordinates.push(projectCordinates[j]);
            }
            // equalFCRCoordinates.push(fcrCordinates[i]);
            // equalFCRCoordinates.push(fcrCordinates[j]);
          }
        }
      }
    }

    const filteredNotEqualCoordinates = projectCordinates.filter(
      (item) => !equalFCRCoordinates.includes(item)
    );
    clearFCRMarkes();

    let markersNotEqualCoordinates = [];
    for (let i = 0; i < filteredNotEqualCoordinates.length; i++) {
      markersNotEqualCoordinates[i] = new googleMap.Marker({
        position: filteredNotEqualCoordinates[i].coordinates,
        mapG,
        icon: {
          url:
            filteredNotEqualCoordinates[i].status === "Completed"
              ? "../../../img/pdfimage/checked.png"
              : filteredNotEqualCoordinates[i].status === "Submitted Request"
              ? "../../../img/pdfimage/submit.png"
              : filteredNotEqualCoordinates[i].status === "QA/QC"
              ? "../../../img/pdfimage/denied.png"
              : "../../../img/pdfimage/on-progress.png",
        },
        // icon: {
        //   url: '../../../img/pdfimage/checked.png',
        // },
      });
      const contentString =
        '<div id="infoDiv">' +
        '<div id="siteNotice">' +
        "</div>" +
        '<div id="bodyContent">' +
        '<div style="width:90%;text-align:center; margin-right: 0px; auto"><h4><a href=/fcr/ViewFCR?id=' +
        ' className="body-link missionName" style={{ color: "#4285F4" }}>' +
        filteredNotEqualCoordinates[i].projectName +
        "</a></h4></div>" +
        '<hr style="width:94%;"/>' +
        "<br>Type " +
        "<h5><b>" +
        filteredNotEqualCoordinates[i].status +
        "</b></h5>" +
        '<hr style="width:94%;"/>' +
        '<img id="imgClick"  style="margin-bottom: 10px;"" src="../../../img/pdfimage/button_zoom-to.png"  " /><br/>' +
        "</div>";
      const infowindow = new googleMap.InfoWindow({
        content: contentString,
        minWidth: 250,
      });
      markersNotEqualCoordinates[i].setMap(mapG);
      googleMap.event.addListener(
        markersNotEqualCoordinates[i],
        "click",
        function () {
          googleMap.event.addListener(infowindow, "domready", function () {
            document
              .getElementById("imgClick")
              .addEventListener("click", function (e) {
                mapG.setZoom(18);
                mapG.panTo(markersNotEqualCoordinates[i].position);
                if (infowindow) infowindow.close();
              });
          });
          infowindow.open({
            anchor: markersNotEqualCoordinates[i],
            mapG,
          });
        }
      );

      gmarkers.push(markersNotEqualCoordinates[i]);
    }

    let markersEqualCoordinates = [];
    let contentStrings = [];
    for (let i = 0; i < equalFCRCoordinates.length; i++) {
      markersEqualCoordinates[i] = new googleMap.Marker({
        position: equalFCRCoordinates[i].coordinates,
        mapG,
        icon: {
          url:
            equalFCRCoordinates[i].status === "Completed"
              ? "../../../img/pdfimage/checked.png"
              : equalFCRCoordinates[i].status === "InProgress"
              ? "../../../img/pdfimage/submit.png"
              : equalFCRCoordinates[i].status === "QA/QC"
              ? "../../../img/pdfimage/denied.png"
              : "../../../img/pdfimage/on-progress.png",
        },
      });

      const contentString1 =
        '<div id="infoDiv">' +
        '<div id="siteNotice">' +
        "</div>" +
        '<div id="bodyContent">' +
        '<div style="width:90%;text-align:center; margin-right: 0px; auto"><h4><a href=/fcr/ViewFCR?id=' +
        'className="body-link missionName" style={{ color: "#4285F4" }}>' +
        equalFCRCoordinates[i].projectName +
        "</a></h4></div>" +
        '<hr style="width:94%;"/>' +
        "Type :" +
        "<h5><b>" +
        equalFCRCoordinates[i].status +
        "</b></h5>" +
        "</div>";
      contentStrings.push(contentString1);

      let finalContentString = "";

      for (let i = 0; i < contentStrings.length; i++) {
        finalContentString += contentStrings[i];
      }
      finalContentString +=
        '<hr style="width:94%;"/><img id="imgClick" style="margin-bottom: 10px;" src="../../../img/pdfimage/button_zoom-to.png"  " /><br/>';
      // finalContentString = '<div style="max-height: 200px; overflow-y: scroll; overflow-x: hidden;">' + finalContentString + '</div>';

      const infowindow = new googleMap.InfoWindow({
        content: finalContentString,
        minWidth: 250,
      });

      markersEqualCoordinates[i].setMap(mapG);
      googleMap.event.addListener(
        markersEqualCoordinates[i],
        "click",
        function () {
          infowindow.open(mapG, markersEqualCoordinates[i]);
          googleMap.event.addListener(infowindow, "domready", function () {
            document
              .getElementById("imgClick")
              .addEventListener("click", function (e) {
                mapG.setZoom(18);
                mapG.panTo(markersEqualCoordinates[i].position);
                if (infowindow) infowindow.close();
              });
          });
          infowindow.open({
            anchor: markersEqualCoordinates[i],
            mapG,
          });
        }
      );

      gmarkers.push(markersEqualCoordinates[i]);
    }
  }, [mapG, googleMap, projects]);

  return (
    <>
      <div className="mb-5" style={{ width: "100%", height: "65vh" }}>
        {dismissingAlertShow && (
          <Alert
            variant={alertVariant}
            onClose={() => setDismissingAlertShow(false)}
            dismissible
          >
            <strong>{alertMessage}</strong>
          </Alert>
        )}
        <GoogleMapReact
          options={getFcrMapOptions}
          yesIWantToUseGoogleMapApiInternals={true}
          onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
          bootstrapURLKeys={{
            key: "AIzaSyATLgeL1EOnoQQzXesxApORlrGhXObWWEY",
            libraries: ["places"],
          }}
          zoom={mapZoom}
          center={mapCenter}
          draggable="true"
        />
      </div>
    </>
  );
};

export default React.memo(GisDefault);
