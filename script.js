// Global variables
let dashboardData = null;
let filteredOrders = [];
let currentPage = 1;
const ordersPerPage = 10;
let charts = {};

// Mock data - Replace with API call later
const mockData = {
    "summary": {
        "todaySales": 1200,
        "yesterdaySales": 1100,
        "lastWeekSales": 7500,
        "lastMonthSales": 28000,
        "todayOrders": 12,
        "yesterdayOrders": 10,
        "lastWeekOrders": 65,
        "lastMonthOrders": 280,
        "returningCustomerRate": 68,
        "averageOrderValue": 450,
        "totalSales": 12500,
        "totalOrders": 310,
        "invoiceAmount": 10825,
        "pendingInvoiceAmount": 1675,
        "growthPercent": {
            "todaySales": 12,
            "yesterdaySales": 8,
            "lastWeekSales": 15,
            "lastMonthSales": 20,
            "todayOrders": -5,
            "yesterdayOrders": 3,
            "lastWeekOrders": 7,
            "lastMonthOrders": 12,
            "returningCustomerRate": 5,
            "averageOrderValue": 8,
            "totalSales": 15,
            "totalOrders": 8,
            "invoiceAmount": 12,
            "pendingInvoiceAmount": -3
        }
    },

    "recentOrders": [
        {"id": "ORD001", "date": "2025-08-05", "customer": "John Doe", "amount": 500, "status": "Completed"},
        {"id": "ORD002", "date": "2025-08-04", "customer": "Jane Smith", "amount": 750, "status": "Completed"},
        {"id": "ORD003", "date": "2025-08-04", "customer": "Mike Johnson", "amount": 1200, "status": "Pending"},
        {"id": "ORD004", "date": "2025-08-03", "customer": "Sarah Wilson", "amount": 300, "status": "Completed"},
        {"id": "ORD005", "date": "2025-08-03", "customer": "David Brown", "amount": 900, "status": "Cancelled"}
    ]
};

// Load dashboard data
async function loadDashboardData() {
    try {
        // Show loading spinner
        const loadingElement = document.getElementById('loading');
        const dashboardElement = document.getElementById('dashboard');
        const errorElement = document.getElementById('error');
        
        if (loadingElement) loadingElement.style.display = 'flex';
        if (dashboardElement) dashboardElement.style.display = 'none';
        if (errorElement) errorElement.style.display = 'none';

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        dashboardData = mockData;
        filteredOrders = [...dashboardData.recentOrders];

        // Hide loading and show dashboard
        if (loadingElement) loadingElement.style.display = 'none';
        if (dashboardElement) dashboardElement.style.display = 'block';

        // Initialize dashboard
        renderMetrics();
        renderCharts();
        renderOrdersTable();
        setupEventListeners();

    } catch (error) {
        console.error('Error loading dashboard:', error);
        const loadingElement = document.getElementById('loading');
        const errorElement = document.getElementById('error');
        
        if (loadingElement) loadingElement.style.display = 'none';
        if (errorElement) errorElement.style.display = 'block';
    }
}

// Render metric cards
function renderMetrics() {
    const metricsGrid = document.getElementById('metricsGrid');
    if (!metricsGrid || !dashboardData) return;
    
    const summary = dashboardData.summary;

    const metrics = [
        {
            label: "Total sales",
            value: `${summary.totalSales.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`,
            growth: summary.growthPercent.totalSales
        },
        {
            label: "Total orders",
            value: summary.totalOrders.toLocaleString(),
            growth: summary.growthPercent.totalOrders
        },
        {
            label: "Average order value",
            value: `${summary.averageOrderValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`,
            growth: summary.growthPercent.averageOrderValue
        },
        {
            label: "Returning customer rate",
            value: `${summary.returningCustomerRate}%`,
            growth: summary.growthPercent.returningCustomerRate
        }
    ];

    metricsGrid.innerHTML = metrics.map(metric => `
        <div class="metric-card">
            <div class="metric-value">${metric.value}</div>
            <div class="metric-label">${metric.label}</div>
            <div class="metric-growth ${metric.growth >= 0 ? 'growth-positive' : 'growth-negative'}">
                <span class="growth-arrow">${metric.growth >= 0 ? '↗' : '↘'}</span>
                ${Math.abs(metric.growth)}%
            </div>
        </div>
    `).join('');
}

// Render charts
function renderCharts() {
    renderDailySalesChart();
    renderAverageOrderChart();
}

function renderDailySalesChart() {
    const ctx = document.getElementById('dailySalesChart');
    if (!ctx) return;
    
    const ctx2d = ctx.getContext('2d');
    
    // Generate labels from January 1st to current date
    const generateYearToDateLabels = () => {
        const labels = [];
        const today = new Date();
        const currentYear = today.getFullYear();
        
        // Generate monthly labels from Jan 1 to current month
        for (let month = 0; month <= today.getMonth(); month++) {
            const date = new Date(currentYear, month, 1);
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            labels.push(`${monthName} 1`);
        }
        
        // Add current date if it's not the 1st of the month
        if (today.getDate() !== 1) {
            const currentMonth = today.toLocaleDateString('en-US', { month: 'short' });
            labels.push(`${currentMonth} ${today.getDate()}`);
        }
        
        return labels;
    };
    
    const dayLabels = generateYearToDateLabels();
    
    // Generate cumulative sales data
    const generateCumulativeSalesData = (baseValue) => {
        const data = [];
        let cumulativeSales = 0;
        
        for (let i = 0; i < dayLabels.length; i++) {
            const dailySales = baseValue + (Math.random() * 0.4 - 0.2) * baseValue;
            cumulativeSales += dailySales;
            data.push(Math.round(cumulativeSales));
        }
        
        return data;
    };
    
    const baseValue2022 = 5000;
    const sales2022 = generateCumulativeSalesData(baseValue2022);
    const sales2023 = generateCumulativeSalesData(baseValue2022 * 1.10);
    const sales2024 = generateCumulativeSalesData(baseValue2022 * 1.21);
    const sales2025 = generateCumulativeSalesData(baseValue2022 * 1.35);

    charts.dailySales = new Chart(ctx2d, {
        type: 'line',
        data: {
            labels: dayLabels,
            datasets: [
                {
                    label: '2025',
                    data: sales2025,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                },
                {
                    label: '2024',
                    data: sales2024,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#e2e8f0' },
                    ticks: {
                        callback: function(value) {
                            return '€' + (value / 1000) + 'K';
                        }
                    }
                },
                x: { grid: { display: false } }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

function renderAverageOrderChart() {
    const ctx = document.getElementById('averageOrderChart');
    if (!ctx) return;
    
    const ctx2d = ctx.getContext('2d');
    
    const timeLabels = ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'];
    const todayData = [320, 280, 350, 420, 480, 520, 450, 380];
    const yesterdayData = [300, 250, 320, 380, 440, 480, 420, 350];

    charts.averageOrder = new Chart(ctx2d, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [
                {
                    label: 'Aug 6, 2025',
                    data: todayData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                },
                {
                    label: 'Aug 5, 2025',
                    data: yesterdayData,
                    borderColor: '#9ca3af',
                    backgroundColor: 'rgba(156, 163, 175, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    borderDash: [5, 5],
                    pointBackgroundColor: '#9ca3af',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#e2e8f0' },
                    ticks: {
                        callback: function(value) {
                            return '€' + value.toLocaleString();
                        }
                    }
                },
                x: { grid: { display: false } }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Render products breakdown
function renderProductsBreakdown() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid || !dashboardData) return;

    const products = dashboardData.products[currentProductTab];
    if (!products || products.length === 0) {
        productsGrid.innerHTML = '<p>No products found for this category.</p>';
        return;
    }

    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-thumbnail">${product.thumbnail}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-sales">${product.sales.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
            <div class="product-percentage">${product.percentage.toFixed(1)}%</div>
        </div>
    `).join('');
}

// Render orders table
function renderOrdersTable() {
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = paginatedOrders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${formatDate(order.date)}</td>
            <td>${order.customer}</td>
                                    <td>€${order.amount.toLocaleString()}</td>
            <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
        </tr>
    `).join('');

    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const paginationInfo = document.getElementById('paginationInfo');
    const paginationControls = document.getElementById('paginationControls');

    if (!paginationInfo || !paginationControls) return;

    const startIndex = (currentPage - 1) * ordersPerPage + 1;
    const endIndex = Math.min(currentPage * ordersPerPage, filteredOrders.length);

    paginationInfo.textContent = `Showing ${startIndex}-${endIndex} of ${filteredOrders.length} orders`;

    let paginationHTML = '';

    // Previous button
    paginationHTML += `<button class="pagination-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += `<span class="pagination-btn" style="cursor: default;">...</span>`;
        }
    }

    // Next button
    paginationHTML += `<button class="pagination-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;

    paginationControls.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderOrdersTable();
    }
}

function filterOrders(searchTerm) {
    if (!dashboardData) return;
    
    filteredOrders = dashboardData.recentOrders.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    currentPage = 1;
    renderOrdersTable();
}



// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchBox = document.getElementById('searchOrders');
    if (searchBox) {
        searchBox.addEventListener('input', (e) => {
            filterOrders(e.target.value);
        });
    }

    // Mobile sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const container = document.querySelector('.container');

    if (sidebarToggle && sidebar && container) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            container.classList.toggle('expanded');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                    container.classList.remove('expanded');
                }
            }
        });
    }

    // Setup sidebar navigation
    setupSidebarNavigation();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function toggleProductsDropdown() {
    const dropdownContent = document.getElementById('dropdownContent');
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    if (!dropdownContent || !dropdownToggle) return;
    
    const toggleText = dropdownToggle.querySelector('span');
    
    if (dropdownContent.classList.contains('show')) {
        dropdownContent.classList.remove('show');
        dropdownToggle.classList.remove('expanded');
        if (toggleText) toggleText.textContent = 'Show 4 more products';
    } else {
        dropdownContent.classList.add('show');
        dropdownToggle.classList.add('expanded');
        if (toggleText) toggleText.textContent = 'Hide additional products';
    }
}

// Sidebar Navigation Functionality
function setupSidebarNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');
            
            // Get the page from data attribute
            const page = item.getAttribute('data-page');
            if (page) {
                navigateToPage(page);
            }
        });
    });

    // Mobile responsive sidebar
    function checkMobile() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (window.innerWidth <= 768) {
            if (sidebarToggle) sidebarToggle.style.display = 'block';
            if (sidebar) sidebar.classList.remove('open');
        } else {
            if (sidebarToggle) sidebarToggle.style.display = 'none';
            if (sidebar) sidebar.classList.remove('open');
        }
    }

    // Check on load and resize
    checkMobile();
    window.addEventListener('resize', checkMobile);
}

function navigateToPage(page) {
    // This function will be called when navigating between pages
    console.log(`Navigating to ${page}`);
}

// Season-specific functions for "This Season" page
function setupSeasonFilters() {
    const timeRangeFilter = document.getElementById('timeRangeFilter');
    const productFilter = document.getElementById('productFilter');
    
    if (timeRangeFilter) {
        timeRangeFilter.addEventListener('change', function() {
            const selectedRange = this.value;
            updateSeasonData(selectedRange);
        });
    }
    
    if (productFilter) {
        productFilter.addEventListener('change', function() {
            const selectedProduct = this.value;
            updateSeasonCharts(selectedProduct);
        });
    }
}

function updateSeasonData(timeRange) {
    console.log(`Updating season data for time range: ${timeRange}`);
    
    // Mock data updates based on time range
    const mockSeasonData = {
        'this-season': {
            revenue: 35500,
            schools: 45,
            kids: 1250,
            growth: 25.9
        },
        'last-season': {
            revenue: 28200,
            schools: 38,
            kids: 980,
            growth: 15.2
        },
        'this-month': {
            revenue: 8900,
            schools: 12,
            kids: 320,
            growth: 8.7
        },
        'last-30-days': {
            revenue: 11200,
            schools: 15,
            kids: 420,
            growth: 12.3
        },
        'custom-range': {
            revenue: 15800,
            schools: 22,
            kids: 680,
            growth: 18.9
        }
    };
    
    const data = mockSeasonData[timeRange] || mockSeasonData['this-season'];
    
    // Update metric cards with new data
    updateSeasonMetrics(data);
    
    // Update charts
    updateSeasonCharts('all-products');
}

function updateSeasonMetrics(data) {
    const metricCards = document.querySelectorAll('.dashboard-metric-card');
    
    if (metricCards.length >= 8) {
        // Update Season Revenue
        const revenueCard = metricCards[0];
        const revenueNumber = revenueCard.querySelector('.metric-number');
        if (revenueNumber) {
            revenueNumber.textContent = `€${data.revenue.toLocaleString()}`;
        }
        
        // Update Schools Onboarded
        const schoolsCard = metricCards[1];
        const schoolsNumber = schoolsCard.querySelector('.metric-number');
        if (schoolsNumber) {
            schoolsNumber.textContent = data.schools;
        }
        
        // Update Total Kids
        const kidsCard = metricCards[3];
        const kidsNumber = kidsCard.querySelector('.metric-number');
        if (kidsNumber) {
            kidsNumber.textContent = data.kids.toLocaleString();
        }
        
        // Update growth percentages
        const growthElements = document.querySelectorAll('.metric-growth');
        growthElements.forEach((element, index) => {
            const isPositive = Math.random() > 0.3; // 70% positive, 30% negative
            const growthValue = isPositive ? 
                `+${(Math.random() * 20 + 5).toFixed(1)}%` : 
                `-${(Math.random() * 10 + 1).toFixed(1)}%`;
            
            element.textContent = growthValue;
            element.className = `metric-growth ${isPositive ? 'positive' : 'negative'}`;
            
            const arrow = element.querySelector('.growth-arrow');
            if (arrow) {
                arrow.textContent = isPositive ? '↗' : '↘';
            }
        });
    }
}

function updateSeasonCharts(selectedProduct) {
    console.log(`Updating season charts for product: ${selectedProduct}`);
    
    // Mock chart data based on product filter
    const chartData = {
        'all-products': {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'],
            currentSeason: [8500, 9200, 7800, 8900, 9500, 8200, 8800, 9100, 8600, 9300, 8700, 8900],
            previousSeason: [6800, 7200, 6500, 7100, 7800, 6900, 7300, 7600, 7100, 7800, 7200, 7400]
        },
        'pack-s': {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'],
            currentSeason: [3200, 3500, 2800, 3300, 3800, 3100, 3400, 3600, 3200, 3700, 3300, 3500],
            previousSeason: [2500, 2800, 2200, 2600, 3000, 2400, 2700, 2900, 2500, 3000, 2600, 2800]
        },
        'pack-m': {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'],
            currentSeason: [2800, 3100, 2600, 3000, 3400, 2700, 3000, 3200, 2800, 3300, 2900, 3100],
            previousSeason: [2200, 2500, 2000, 2400, 2800, 2100, 2400, 2600, 2200, 2700, 2300, 2500]
        },
        'pack-l': {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'],
            currentSeason: [1800, 2000, 1600, 1900, 2200, 1700, 1900, 2000, 1800, 2100, 1900, 2000],
            previousSeason: [1400, 1600, 1200, 1500, 1800, 1300, 1500, 1600, 1400, 1700, 1500, 1600]
        },
        'pack-xl': {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'],
            currentSeason: [700, 800, 600, 700, 900, 600, 700, 800, 700, 800, 700, 800],
            previousSeason: [500, 600, 400, 500, 700, 400, 500, 600, 500, 600, 500, 600]
        }
    };
    
    const data = chartData[selectedProduct] || chartData['all-products'];
    
    // Update the season performance chart
    updateSeasonPerformanceChart(data);
}

function updateSeasonPerformanceChart(data) {
    const canvas = document.getElementById('seasonPerformanceChart');
    if (!canvas) return;
    
    // Destroy existing chart if it exists
    if (charts.seasonPerformance) {
        charts.seasonPerformance.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    
    charts.seasonPerformance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Current Season',
                    data: data.currentSeason,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                },
                {
                    label: 'Previous Season',
                    data: data.previousSeason,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#e2e8f0' },
                    ticks: {
                        callback: function(value) {
                            return '€' + (value / 1000) + 'K';
                        }
                    }
                },
                x: { grid: { display: false } }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Initialize season page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the "This Season" page
    const isThisSeasonPage = window.location.pathname.includes('this-season.html') || 
                            document.querySelector('[data-page="this-season"]')?.classList.contains('active');
    
    if (isThisSeasonPage) {
        setupSeasonFilters();
        console.log('Season filters initialized');
    }
});

