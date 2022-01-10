import React from "react";

import { keyframes, styled } from "@mui/material/styles";
import Button from "@mui/material/Button";


const rainbow = keyframes`
  100%, 0% {
    background-color: rgb(255,0,0);
  }
  8% {
    background-color: rgb(255,127,0);
  }
  16% {
    background-color: rgb(255,255,0);
  }
  25% {
    background-color: rgb(127,255,0);
  }
  33% {
    background-color: rgb(0,255,0);
  }
  41% {
    background-color: rgb(0,255,127);
  }
  50% {
    background-color: rgb(0,255,255);
  }
  58% {
    background-color: rgb(0,127,255);
  }
  66% {
    background-color: rgb(0,0,255);
  }
  75% {
    background-color: rgb(127,0,255);
  }
  83% {
    background-color: rgb(255,0,255);
  }
  91% {
    background-color: rgb(255,0,127);
  }
`

export const ShibeButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  color: theme.palette.common.black,
  "&:hover": {
    animation: `${rainbow} 2.5s linear`,
    animationIterationCount: "infinite",
  },
}));