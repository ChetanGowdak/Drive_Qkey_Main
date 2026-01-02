

import React from "react";
import {
  FileIcon,
  PdfIcon,
  PermMediaIcon,
  AudioIcon,
  VideoIcon,
} from "./SvgIcons";
const FileIcons = ({ type = "" }) => {
  const t = type || "";
  return t.includes("pdf") ? (
    <PdfIcon />
  ) : t.includes("image") ? (
    <PermMediaIcon />
  ) : t.includes("video") ? (
    <VideoIcon />
  ) : t.includes("audio") ? (
    <AudioIcon />
  ) : (
    <FileIcon />
  );
};

export default FileIcons;
