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
    const response = await fetch("Trees.geojson");
    
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

        // Mapping functions for numeric values
        function getSweetnessText(value) {
          const map = { 1: 'Not Sweet', 2: 'A little sweet', 3: 'Sweet', 4: 'Very Sweet' };
          return map[value] || value;
        }

        function getSournessText(value) {
          const map = { 1: 'Not Sour', 2: 'A little sour', 3: 'Sour', 4: 'Very Sour' };
          return map[value] || value;
        }

        function getTextureText(value) {
          const map = { 1: 'Soft', 2: 'Crisp', 3: 'Crunchy', 4: 'Juicy' };
          return map[value] || value;
        }

        function getDescriptionText(value) {
          const map = { 1: 'Fresh', 2: 'Tart', 3: 'Sweet', 4: 'Juicy' };
          return map[value] || value;
        }

        function getEatAgainText(value) {
          const map = { 1: 'No', 2: 'Maybe', 3: 'Yes', 4: 'Definitely Yes' };
          return map[value] || value;
        }

        const popupContent = `
          <div>
            <h3>${props.Name}</h3>
            ${props.Sweetness ? `<p><strong>Apple Sweetness:</strong> ${getSweetnessText(props.Sweetness)}</p>` : ''}
            ${props.Sourness ? `<p><strong>Apple Sourness:</strong> ${getSournessText(props.Sourness)}</p>` : ''}
            ${props.Texture ? `<p><strong>Apple Texture:</strong> ${getTextureText(props.Texture)}</p>` : ''}
            ${props.Descript ? `<p><strong>Apple Description:</strong> ${getDescriptionText(props.Descript)}</p>` : ''}
            ${props.EatAgain ? `<p><strong>Would you eat it again?</strong> ${getEatAgainText(props.EatAgain)}</p>` : ''}

            <div>
              <strong>Tree Image:</strong><br/>
              <img class="popup-img" src="${props.TreeImg}" alt="tree image"/>
            </div>

            <div>
              <strong>Flower Image:</strong><br/>
              <img class="popup-img" src="${props.FlowrImg}" alt="flower image"/>
            </div>

            <div>
              <strong>Fruit Image:</strong><br/>
              <img class="popup-img" src="${props.FruitImg}" alt="fruit image"/>
            </div>

            ${props.Notes ? `<p><em>${props.Notes}</em></p>` : ''}
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
    console.error("Error loading Trees.geojson:", error);
  }
}

// Wait for DOM to be fully loaded before calling loadTrees
document.addEventListener('DOMContentLoaded', loadTrees);
