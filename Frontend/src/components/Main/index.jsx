import styles from "./styles.module.css";
import React, { useRef, useState } from "react";
import CryptoJS from "crypto-js";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Main = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const inputRef = useRef(null);
  const [img, setImg] = useState(null);
  const [hash, setHash] = useState(null);
  const [verified, setVerified] = useState(false); // State to track verification status

  const handleImgclick = () => {
    inputRef.current.click();
  };

  const handleImgchange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const sha1Hash = CryptoJS.SHA1(binaryStr).toString();
      const sha256Hash = CryptoJS.SHA256(binaryStr).toString();
      const md5Hash = CryptoJS.MD5(binaryStr).toString();
      setHash({ sha1Hash, sha256Hash, md5Hash });
      setImg(file);
    };
    if (file) reader.readAsBinaryString(file);
  };

  const handleSubmit = async () => {
    const url = "http://localhost:500/api/upload";
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const res = await axios.post(url, { hash: hash }, { headers });
    if (res.data.status === "success") {
      toast.success(res.data.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setImg(null);
      setHash(null);
      setVerified(true); // Image is verified after successful upload
    }
    console.log("res", res);
  };

  const handleVerify = async () => {
    const url = "http://localhost:500/api/verify";
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const res = await axios.post(url, { hash: hash }, { headers });

    // toast.success("Image verified successfully!", {
    //   position: "top-right",
    //   autoClose: 5000,
    //   hideProgressBar: false,
    //   closeOnClick: true,
    //   pauseOnHover: true,
    //   draggable: true,
    //   progress: undefined,
    //   theme: "light",
    // });
  };

  return (
    <div className={styles.main_container}>
      <ToastContainer />
      <nav className={styles.navbar}>
        <h1>Image Verifier</h1>
        <button className={styles.white_btn} onClick={handleLogout}>
          Logout
        </button>
      </nav>
      <div className={styles.imgupload_Container}>
        <div className={styles.box_dec}>
          <label
            htmlFor="image-upload-input"
            className={styles.image_upload_label}
          >
            {img ? img.name : "Choose an Image"}
          </label>
          <div onClick={handleImgclick} style={{ cursor: "pointer" }}>
            {img ? (
              <img
                src={URL.createObjectURL(img)}
                alt="new img"
                className={styles.img_display_after}
              />
            ) : (
              <img
                src="images.png"
                alt="uploadimg"
                className={styles.img_display_before}
              />
            )}
            <input
              type="file"
              accept="image/*"
              ref={inputRef}
              onChange={handleImgchange}
              style={{ display: "none" }}
            />
          </div>
          <button
            className={styles.img_upload_btn}
            // type="submit"
            onClick={handleSubmit}
            disabled={!img}
          >
            Upload
          </button>
          <button
            className={styles.verify_btn} // Define CSS for this button in your styles.module.css file
            onClick={handleVerify}
            disabled={!img} // Disable the button until the image is verified
          >
            Verify
          </button>
        </div>
        {hash && (
          <div className={styles.hash_values_container}>
            <h2>Hash Values</h2>
            <div className={styles.hash_value}>
              <span className={styles.hash_label}>SHA-1:</span> {hash.sha1Hash}
            </div>
            <div className={styles.hash_value}>
              <span className={styles.hash_label}>SHA-256:</span>{" "}
              {hash.sha256Hash}
            </div>
            <div className={styles.hash_value}>
              <span className={styles.hash_label}>MD5:</span> {hash.md5Hash}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;
