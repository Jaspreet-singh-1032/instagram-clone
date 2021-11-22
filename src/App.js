import { useState, useEffect } from "react";
import "./App.css";
import Modal from "@mui/material/Modal";
// import InstagramEmbed from "react-instagram-embed";
import Box from "@mui/material/Box";
import { Button, Input } from "@mui/material";
import { db, auth } from "./firebase";
import Post from "./Post";
import ImageUpload from "./ImageUpload";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

function App() {
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false); // handle signup modal
  const [openLogin, setOpenLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unSubscribe = auth.onAuthStateChanged((authUser) => {
      console.log(authUser);
      if (authUser) {
        // user logged in
        setUser(authUser);
        if (authUser.displayName) {
          // don't update name
        } else {
          return authUser.updateProfile({
            displayName: username,
          });
        }
      } else {
        // user logged out
        setUser(null);
      }
    });
    return () => {
      unSubscribe();
    };
  }, [user, username]);

  const handleSignUp = (event) => {
    event.preventDefault();
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        setOpen(false);
        setPassword("");
        return authUser.user.updateProfile({
          displayName: username,
        });
      })
      .catch((error) => alert(error.message));
  };
  const handleLogin = (event) => {
    event.preventDefault();
    auth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        setOpenLogin(false);
        setPassword("");
      })
      .catch((error) => alert(error.message));
  };
  useEffect(() => {
    db.collection("post")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setPosts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            post: doc.data(),
          }))
        );
      });
  }, []);
  return (
    <div className="app">
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <form className="app__signup">
            <center>
              <img
                className="app__headerImage"
                src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                alt="insta logo"
              />
            </center>
            <Input
              className="app__input"
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              className="app__input"
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              className="app__input"
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" onClick={handleSignUp}>
              Sign Up
            </Button>
          </form>
        </Box>
      </Modal>

      {/*  login modal */}
      <Modal
        open={openLogin}
        onClose={() => setOpenLogin(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <form className="app__signup">
            <center>
              <img
                className="app__headerImage"
                src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                alt="insta logo"
              />
            </center>
            <Input
              className="app__input"
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              className="app__input"
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" onClick={handleLogin}>
              Sign In
            </Button>
          </form>
        </Box>
      </Modal>
      <div className="app__header">
        <img
          className="app__headerImage"
          src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
          alt="insta logo"
        />
        {user ? (
          <Button onClick={() => auth.signOut()}>Logout</Button>
        ) : (
          <div className="app__loginContainer">
            <Button onClick={() => setOpen(true)}>Sign Up</Button>
            <Button onClick={() => setOpenLogin(true)}>Sign In</Button>
          </div>
        )}
      </div>
      <div className="app__posts">
        <div>
          {posts.map(({ id, post }) => {
            return (
              <Post
                key={id}
                user={user}
                postId={id}
                avatar={post.avatar}
                userName={post.userName}
                imageUrl={post.imageUrl}
                caption={post.caption}
              />
            );
          })}
        </div>
      </div>
      {user && <ImageUpload username={user.displayName} />}
      {/* <InstagramEmbed
        url="https://www.instagram.com/p/B_uf9dmAGPw/"
        maxWidth={320}
        hideCaption={false}
        containerTagName="div"
        protocol=""
        injectScript
        onLoading={() => {}}
        onSuccess={() => {}}
        onAfterRender={() => {}}
        onFailure={() => {}}
      /> */}
    </div>
  );
}

export default App;
