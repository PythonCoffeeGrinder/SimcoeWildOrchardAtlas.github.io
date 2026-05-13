// Initialize map centered on Simcoe County, Ontario
const map = L.map("map").setView([44.4, -79.7], 11);

// Base layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// Load GeoJSON data
async function loadTrees() {
  try {
    console.log("Starting to load trees...");
    const response = await fetch("trees.json");
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Trees data loaded:", data);

    function getPopupOptions() {
      const isMobile = window.innerWidth <= 768;
      const mapHeight = map.getSize().y;
      const mapWidth = map.getSize().x;

      return {
        maxWidth: isMobile ? Math.min(280, Math.floor(mapWidth * 0.75)) : 380,
        maxHeight: isMobile ? Math.max(Math.floor(mapHeight * 0.45), 180) : Math.max(mapHeight - 40, 180),
        autoPan: true,
        autoPanPadding: [16, 16],
        autoPanPaddingTopLeft: [16, 16],
        autoPanPaddingBottomRight: [16, 16],
        keepInView: true,
        closeButton: true
      };
    }

    const geoJsonLayer = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        console.log("Creating marker at", latlng);
        return L.circleMarker(latlng, {
          radius: 8,
          fillColor: "#2f5d50",
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        });
      },
      onEachFeature: function (feature, layer) {
        const props = feature.properties;

        const popupContent = `
          <div>
            <h3>${props.tree_name}</h3>
            ${props.apple_sweetness ? `<p><strong>Apple Sweetness:</strong> ${props.apple_sweetness}</p>` : ''}
            ${props.apple_sourness ? `<p><strong>Apple Sourness:</strong> ${props.apple_sourness}</p>` : ''}
            ${props.apple_texture ? `<p><strong>Apple Texture:</strong> ${props.apple_texture}</p>` : ''}
            ${props.apple_description ? `<p><strong>Apple Description:</strong> ${props.apple_description}</p>` : ''}
            ${props.eat_again ? `<p><strong>Would you eat it again?</strong> ${props.eat_again}</p>` : ''}

            <div>
              <strong>Tree Image:</strong><br/>
              <img class="popup-img" src="${props.tree_picture_url}" alt="tree image"/>
            </div>

            <div>
              <strong>Flower Image:</strong><br/>
              <img class="popup-img" src="${props.flower_picture_url}" alt="flower image"/>
            </div>

            <div>
              <strong>Fruit Image:</strong><br/>
              <img class="popup-img" src="${props.fruit_picture_url}" alt="fruit image"/>
            </div>

            ${props.discovery_date ? `<p><strong>Date:</strong> ${props.discovery_date}</p>` : ''}
            ${props.misc_info ? `<p><em>${props.misc_info}</em></p>` : ''}
          </div>
        `;

        layer.bindPopup(popupContent, getPopupOptions());
      }
    }).addTo(map);
    
    console.log("GeoJSON layer added to map:", geoJsonLayer);

    map.on('popupopen', function (e) {
      const currentHeight = Math.max(map.getSize().y - 40, 180);
      e.popup.options.maxHeight = currentHeight;
      if (typeof e.popup.update === 'function') {
        e.popup.update();
      }
    });

  } catch (error) {
    console.error("Error loading trees.json:", error);
  }
}

// Wait for DOM to be fully loaded before calling loadTrees
document.addEventListener('DOMContentLoaded', loadTrees);
