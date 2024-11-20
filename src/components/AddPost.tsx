import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

const AddPost: React.FC = () => {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    try {
      let imageUrl = "";
      if (image) {
        const imageRef = ref(storage, `posts/${user.uid}/${Date.now()}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        text,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      setText("");
      setImage(null);
      navigate("/");
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-post p-4 mx-auto max-w-2xl">
      <h2 className="text-2xl font-bold mb-4 text-center">Create a New Post</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        type="file"
        onChange={handleImageChange}
        accept="image/*"
        className="mb-4"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Post
      </button>
    </form>
  );
};

export default AddPost;
