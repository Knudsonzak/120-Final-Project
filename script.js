// Sign up 
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('signup-error');
        
        // Get existing users or initialize empty array
        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if email exists
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            errorDiv.textContent = 'Email already registered. Please log in.';
            errorDiv.style.color = '#ff6b6b';
            errorDiv.style.marginTop = '1rem';
            return;
        }
        
        // Add user to array
        users.push({
            name: name,
            email: email,
            password: password
        });
        
        // Save to localStorage
        localStorage.setItem('users', JSON.stringify(users));
        
        //  success message
        errorDiv.textContent = 'Account created successfully! Redirecting to login...';
        errorDiv.style.color = '#4CAF50';
        errorDiv.style.marginTop = '1rem';
        
        // Redirect to login page 
        setTimeout(() => {
            window.location.href = 'log-in.html';
        }, 2000);
    });
}

// Log in 
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nameOrEmail = document.getElementById('name').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Find user by email OR name
        const user = users.find(u => 
            (u.email === nameOrEmail || u.name === nameOrEmail) && u.password === password
        );
        
        if (user) {
            // Save user info
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            errorDiv.textContent = 'Login successful! Redirecting...';
            errorDiv.style.color = '#4CAF50';
            errorDiv.style.marginTop = '1rem';
            
            // Redirect to home 
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } else {
            errorDiv.textContent = 'Invalid username/email or password. Please try again.';
            errorDiv.style.color = '#ff6b6b';
            errorDiv.style.marginTop = '1rem';
        }
    });
}

// Check authentication and update nav
function updateNavigation() {
    const currentUser = localStorage.getItem('currentUser');
    const loginItem = document.querySelector('.login-item');
    const signupItem = document.querySelector('.signup-item');
    const signoutItem = document.querySelector('.signout-item');
    
    if (currentUser) {
        // User is logged in 
        if (loginItem) loginItem.style.display = 'none';
        if (signupItem) signupItem.style.display = 'none';
        if (signoutItem) signoutItem.style.display = 'block';
    } else {
        // User is not logged in 
        if (loginItem) loginItem.style.display = 'block';
        if (signupItem) signupItem.style.display = 'block';
        if (signoutItem) signoutItem.style.display = 'none';
    }
}

// Sign out 
const signoutBtn = document.getElementById('signout-btn');
if (signoutBtn) {
    signoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        localStorage.removeItem('currentUser');
    
        updateNavigation();
        
        window.location.href = 'index.html';
    });
}
updateNavigation();
