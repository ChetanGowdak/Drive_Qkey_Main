import React, { useState } from "react";
import styled from "styled-components";
import { db, auth } from "../../firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { selectSidebarBool } from "../../store/BoolSlice";
import FileUploadModal from "./FileUploadModal";
import AddFile from "./AddFile";
import SidebarTabs from "./SidebarTabs";
import PasswordModal from "../common/PasswordModal";
import { encryptFile } from "../utils/crypto";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { uploadToCloudinary } from "../common/cloudinaryApi";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [selectedFile, setSelectedFile] = useState("");

  // 🔐 password modal
  const [showPassword, setShowPassword] = useState(false);

  const sidebarBool = useSelector(selectSidebarBool);

  // 📁 file picker
  const handleFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSelectedFile(e.target.files[0].name);
    }
  };

  // 📤 open password modal
  const handleUpload = (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("No file selected");
      return;
    }
    setShowPassword(true);
  };

  // 🔐 encrypt + upload (NON-RESUMABLE — SAFE)
  const handleEncryptAndUpload = async (password) => {
    setShowPassword(false);

    if (!password || !file) {
      toast.warn("Upload cancelled");
      return;
    }

    if (uploading) return;

    setUploading(true);
    setProgress(0);

    try {
      // 1️⃣ Encrypt locally (your crypto.js)
      const { encryptedBlob, meta } = await encryptFile(file, password);

      // 🔒 Safety check (prevents zero-byte poison uploads)
      if (!encryptedBlob || encryptedBlob.size === 0) {
        throw new Error("Encrypted file is empty");
      }

      // 2️⃣ Create UNIQUE public_id for Cloudinary
      const publicId = `files/${uuidv4()}_${meta.originalName}.enc`;

      // 3️⃣ Upload to Cloudinary
      const { url } = await uploadToCloudinary(encryptedBlob, publicId);

      setProgress(100);

      // 4️⃣ Save metadata to Firestore
      if (!auth.currentUser) {
        throw new Error("Not authenticated - please log in again");
      }

      const docData = {
        userId: auth.currentUser.uid,
        timestamp: serverTimestamp(),
        filename: meta.originalName,
        fileURL: url,
        path: publicId,
        size: encryptedBlob.size,
        originalSize: meta.originalSize,
        contentType: "application/octet-stream",
        originalType: meta.originalType,
        isEncrypted: true,
        crypto: {
          alg: meta.alg,
          kdf: meta.kdf,
          iters: meta.iters,
          salt_b64: meta.salt_b64,
          iv_b64: meta.iv_b64,
          wrapped_key_b64: meta.wrapped_key_b64,
          key_wrap_iv_b64: meta.key_wrap_iv_b64,
        },
        starred: false,
      };

      await addDoc(collection(db, "myfiles"), docData);

      toast.success("Encrypted upload complete ✅");

      // reset UI
      setUploading(false);
      setOpen(false);
      setFile(null);
      setSelectedFile("");
      setProgress(0);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Upload failed");
      setUploading(false);
    }
  };

  return (
    <>
      {/* 📤 Upload Modal */}
      <FileUploadModal
        open={open}
        setOpen={setOpen}
        handleUpload={handleUpload}
        uploading={uploading}
        handleFile={handleFile}
        selectedFile={selectedFile}
        progress={progress}
      />

      {/* 🔐 Password Modal */}
      {showPassword && (
        <PasswordModal
          title="Set encryption password"
          onSubmit={handleEncryptAndUpload}
          onCancel={() => setShowPassword(false)}
        />
      )}

      <SidebarContainer sidebarbool={sidebarBool ? "true" : "false"}>
        <AddFile onClick={() => setOpen(true)} />
        <SidebarTabs />
      </SidebarContainer>
    </>
  );
};

export default Sidebar;

/* ================= STYLES ================= */

const SidebarContainer = styled.div`
  width: 180px;
  padding-top: 10px;
  border-right: 1px solid var(--border);
  transition: all 0.1s linear;
  position: ${(props) =>
    props.sidebarbool === "true" ? "relative" : "absolute"};
  left: ${(props) => (props.sidebarbool === "true" ? "0" : "-100%")};

  @media screen and (max-width: 768px) {
    width: 65px;
  }
`;
