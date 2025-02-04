/* === Imports === */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { createUserWithEmailAndPassword  } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { signInWithEmailAndPassword  } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { onAuthStateChanged  } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js"
import { collection } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { addDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { serverTimestamp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

/* === Firebase Setup === */
const firebaseConfig = {
    apiKey: "AIzaSyAiqoJiNIkSadOyzac4ahxNtWONpgmOeWg",
    authDomain: "hot-and-cold-ebeac.firebaseapp.com",
    projectId: "hot-and-cold-ebeac",
    storageBucket: "hot-and-cold-ebeac.firebasestorage.app",
    messagingSenderId: "820278008071",
    appId: "1:820278008071:web:4f4a01e63d7b286bb88da2"
  };
  const app = initializeApp(firebaseConfig);
  console.log(app.options.projectId)
  const auth = getAuth(app)
  const db = getFirestore(app);

  console.log(auth)
  console.log(db)


/* === UI === */

/* == UI - Elements == */

const viewLoggedOut = document.getElementById("logged-out-view")
const viewLoggedIn = document.getElementById("logged-in-view")

const signInWithGoogleButtonEl = document.getElementById("sign-in-with-google-btn")

const emailInputEl = document.getElementById("email-input")
const passwordInputEl = document.getElementById("password-input")

const signInButtonEl = document.getElementById("sign-in-btn")
const createAccountButtonEl = document.getElementById("create-account-btn")

const signOutButtonEl = document.getElementById("sign-out-btn")

const userProfilePictureEl = document.getElementById("user-profile-picture")

const userGreetingEl = document.getElementById("user-greeting")

const textareaEl = document.getElementById("post-input")
const postButtonEl = document.getElementById("post-btn")

/* == UI - Event Listeners == */

signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle)

signInButtonEl.addEventListener("click", authSignInWithEmail)
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail)

signOutButtonEl.addEventListener("click", authSignOut)
postButtonEl.addEventListener("click", postButtonPressed)

/* === Main Code === */

showLoggedOutView()

onAuthStateChanged(auth, (user) => {
  if (user) {
    
    showLoggedInView()
    showProfilePicture(userProfilePictureEl,user)
    showUserGreeting(userGreetingEl, user)
  } else {
    showLoggedOutView()
  }
});

/* === Functions === */
/* = Functions - Firebase - Cloud Firestore = */




async function addPostToDB(postBody, user, emoji) {
  try {
      const docRef = await addDoc(collection(db, "Posts"), {
          body: postBody,
          uid: user.uid,
          createdAt: serverTimestamp(),
          emoji: emoji,  
      });

      console.log("Document written with ID: ", docRef.id);
  } catch (error) {
      console.error(error.message);
  }
}


 


/* = Functions - Firebase - Authentication = */

function authSignInWithGoogle() {
    console.log("Sign in with Google")
}

function authSignInWithEmail() {
    console.log("Sign in with email and password")
    const email = emailInputEl.value
    const password= passwordInputEl.value

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
          showLoggedInView()
          
    })
    .catch((error) => {
      console.error(error.message)
    });

}

function authCreateAccountWithEmail() {
    const email = emailInputEl.value
    const password= passwordInputEl.value


  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
        showLoggedInView()
  })
  .catch((error) => {
    console.error(error.message)
  });


}  


/* == Functions - UI Functions == */

function showLoggedOutView() {
    hideView(viewLoggedIn)
    showView(viewLoggedOut)
 }
 
 
 function showLoggedInView() {
    hideView(viewLoggedOut)
    showView(viewLoggedIn)
 }
 
 
 function showView(view) {
    view.style.display = "flex"
 }
 
 
 function hideView(view) {
    view.style.display = "none"
 }
 
function authSignOut(){
    
    const auth = getAuth();
    signOut(auth).then(() => {
      showLoggedOutView()
    }).catch((error) => {
      console.error(error.message)
    });
}
function showProfilePicture(imgElement, user) {
    
    if (user && user.photoURL) {
        imgElement.src = user.photoURL; 
    } else {
        imgElement.src = "assets/images/defaultPic.jpg"; 
    }
    console.log(imgElement.src); 
}
function showUserGreeting(element, user) {

    if(user && user.displayName){
        element.textContent="Hi "+user.displayName;
    }
    else{
      element.textContent="Hey friend, how are you?";
    }
 }
 let selectedEmoji = "✨";  

 
 const emojiButtons = document.querySelectorAll(".emoji-btn");
 emojiButtons.forEach(button => {
   button.addEventListener("click", (e) => {
     selectedEmoji = e.target.getAttribute("data-emoji");
     console.log("Selected Emoji:", selectedEmoji);
   });
 });
 

 function postButtonPressed() {
     const postBody = textareaEl.value;
     const user = auth.currentUser;
 
     if (postBody) {
         addPostToDB(postBody, user, selectedEmoji);
         clearInputField(textareaEl);
         selectedEmoji = "✨"; 
     }
 }
 
 const postsListEl = document.getElementById("posts-list");
 const fetchPostsButtonEl = document.getElementById("fetch-post-btn");
 
 fetchPostsButtonEl.addEventListener("click", fetchPosts);
 
 async function fetchPosts() {
  try {
      const postsRef = collection(db, "Posts");
      const q = query(postsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      postsListEl.innerHTML = "";  
      querySnapshot.forEach((doc) => {
          const post = doc.data();
          const postElement = document.createElement("li");
          const createdAt = post.createdAt.toDate();
          const formattedTime = createdAt.toLocaleString();
          const emoji = post.emoji || "✨";  
          postElement.innerHTML = `
          <div class="post-header">
              <p><small>Posted on: ${formattedTime}</small></p>
              <span class="emoji">${emoji}</span>
          </div>
          <p>${post.body}</p>
      `;
      
      postsListEl.appendChild(postElement);
  });
  } catch (error) {
      console.error("Error fetching posts: ", error.message);
  }
}

const emojiButtonEl = document.querySelector("#emoji-btn");  
const emojiPickerEl = document.querySelector(".emoji-picker");  
emojiButtonEl.addEventListener("click", toggleEmojiPicker);
function toggleEmojiPicker() {
    if (emojiPickerEl.style.display === "none" || emojiPickerEl.style.display === "") {
        emojiPickerEl.style.display = "block";  
    } else {
        emojiPickerEl.style.display = "none";  
    }
}


 
 

//credit: coursera
