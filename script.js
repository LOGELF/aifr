let entitiesData = [];
let currentState = "ALL";
let currentCategory = "ALL";
let searchQuery = "";

// Custom Scroll Bar Styles
const style = document.createElement('style');
style.innerHTML = `
  .custom-scroll::-webkit-scrollbar { width: 6px; }
  .custom-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 8px; }
  .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
  .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;
document.head.appendChild(style);

// 1. FETCH DATA FROM JSON
async function loadData() {
  try {
    const response = await fetch('./data/entities.json');
    entitiesData = await response.json();
    applyFilters();
  } catch (error) {
    console.error("Error loading entities:", error);
    document.getElementById('entitiesContainer').innerHTML = `
      <div class="col-span-2 text-center py-10 text-slate-500">
        Failed to load relief listings. Please refresh the page.
      </div>`;
  }
}

// 2. MAIN FILTER ENGINE
function applyFilters() {
  const container = document.getElementById('entitiesContainer');
  
  const filtered = entitiesData.filter(item => {
    // State Filter
    const matchesState = (currentState === "ALL") || (item.state.toUpperCase() === currentState.toUpperCase());
    
    // Category Filter
    const matchesCategory = (currentCategory === "ALL") || (item.category.toLowerCase() === currentCategory.toLowerCase());
    
    // Search Query Filter
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === "" || 
      item.title.toLowerCase().includes(query) ||
      item.area.toLowerCase().includes(query) ||
      item.focus.toLowerCase().includes(query) ||
      item.badge.toLowerCase().includes(query);

    return matchesState && matchesCategory && matchesSearch;
  });

  renderCards(filtered);
}

// 3. RENDER CARDS
function renderCards(data) {
  const container = document.getElementById('entitiesContainer');

  if (data.length === 0) {
    container.innerHTML = `
      <div class="col-span-1 md:col-span-2 text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
        <i data-lucide="search-x" class="w-10 h-10 text-slate-400 mx-auto mb-3"></i>
        <p class="text-slate-700 font-semibold">No relief initiatives found</p>
        <p class="text-xs text-slate-500 mt-1">Try selecting another state, category, or clear your search keywords.</p>
      </div>`;
    lucide.createIcons();
    return;
  }

  container.innerHTML = data.map(item => `
    <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between space-y-4">
      <div>
        <div class="flex items-center justify-between text-xs mb-2">
          <span class="bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            ${item.state} • ${item.badge}
          </span>
          <span class="text-slate-500 font-medium">${item.verified}</span>
        </div>
        <h3 class="text-lg font-bold text-slate-900 mb-1">${item.title}</h3>
        <p class="text-xs text-red-600 font-semibold mb-3 flex items-center gap-1">
          <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
          Primary Area: ${item.area}
        </p>
        <p class="text-sm text-slate-600 leading-relaxed">${item.focus}</p>
      </div>

      <div class="pt-3 border-t border-slate-100 space-y-3">
        ${item.bank ? `
          <div class="bg-slate-50 p-3 rounded-lg text-xs space-y-1 text-slate-700">
            <p class="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5 flex items-center gap-1">
              <i data-lucide="landmark" class="w-3.5 h-3.5 text-slate-600"></i> Bank Details
            </p>
            <p><span class="text-slate-500 font-medium">Beneficiary Name:</span> ${item.bank.beneficiary}</p>
            <p><span class="text-slate-500 font-medium">Account No.:</span> <strong class="font-mono">${item.bank.accountNo}</strong></p>
            <p><span class="text-slate-500 font-medium">IFSC Code:</span> <strong class="font-mono">${item.bank.ifsc}</strong></p>
          </div>
        ` : ''}

        ${item.upi && item.upi !== 'unavailable' ? `
          <div class="bg-slate-50 p-2.5 rounded-lg flex items-center justify-between text-xs font-mono text-slate-700">
            <span>UPI: <strong>${item.upi}</strong></span>
            <button onclick="navigator.clipboard.writeText('${item.upi}'); alert('UPI ID copied to clipboard!')" class="text-blue-600 font-sans font-semibold hover:underline">Copy</button>
          </div>
        ` : ''}
        
        <div class="grid grid-cols-2 gap-2">
          <a href="${item.proofUrl}" target="_blank" class="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            <i data-lucide="camera" class="w-3.5 h-3.5"></i>
            Live Proof
          </a>
          <a href="${item.donateUrl || item.proofUrl}" target="_blank" class="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
            <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            Donate Direct
          </a>
        </div>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

// 4. EVENT LISTENERS
function selectState(stateName, btnElement) {
  currentState = stateName;
  document.querySelectorAll('.state-btn').forEach(btn => {
    btn.className = "state-btn whitespace-nowrap px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-150 border-slate-300 bg-white text-slate-700 hover:bg-slate-100";
  });
  btnElement.className = "state-btn whitespace-nowrap px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-150 border-red-600 bg-red-600 text-white shadow-sm";
  applyFilters();
}

function filterCategory(category, btnElement) {
  currentCategory = category;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.className = "tab-btn flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 flex items-center justify-center gap-2";
  });
  btnElement.className = "tab-btn flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 bg-white text-slate-900 shadow-sm flex items-center justify-center gap-2";
  applyFilters();
}

function handleSearch(inputElement) {
  searchQuery = inputElement.value;
  applyFilters();
}

// Initialize on page load
window.onload = () => {
  loadData();
};
