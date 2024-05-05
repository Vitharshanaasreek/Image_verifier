import styles from "./styles.module.css";
import React, { useRef, useState } from "react";

const Main = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const inputRef = useRef(null);
  const [img, setImg] = useState(null);

  const handleImgclick = () => {
    inputRef.current.click();
  };
  const handleImgchange = (event) => {
    const file = event.target.files[0];
    console.log(file);
    setImg(event.target.files[0]);
  };

  return (
    <div className={styles.main_container}>
      <nav className={styles.navbar}>
        <h1>Image Verifier</h1>
        <button className={styles.white_btn} onClick={handleLogout}>
          Login
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
              ref={inputRef}
              onChange={handleImgchange}
              style={{ display: "none" }}
            />
          </div>
          <button className={styles.img_upload_btn} type="submit">
            upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default Main;
