import React from "react";

import { styled }from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { Track } from "../Track";
import { columns, useCollapse } from "./columns";

const HeadTableCell = styled(TableCell)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: "12px",
  fontWeight: 400,
  letterSpacing: ".1em",
  lineHeight: theme.spacing(2),
  textTransform: "uppercase",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  padding: theme.spacing(1)
}));

export const PlaylistTracks = ({ items }) => {
  const collapse = useCollapse();

  return (
    <TableContainer>
      <Table aria-label="playlist tracks">
        <TableHead>
          <TableRow>
            {Object.entries(columns)
              .filter(([_, column]) => !(collapse && column.collapse))
              .map(([key, column]) => {
                const { align, label, sx } = column;
                return (
                  <HeadTableCell
                    key={key}
                    align={align}
                    sx={sx}
                  >
                    {label}
                  </HeadTableCell>
                )}
              )}
          </TableRow>
        </TableHead>
        <TableBody>
          {items
            .map((playlistTrack, i) => {
              const { added_at, track } = playlistTrack;
              const { album, artists, duration_ms, name, external_urls } = track;
              return (
                <Track 
                  key={i}
                  addedAt={added_at}
                  album={album}
                  artists={artists}
                  duration={duration_ms}
                  index={i+1}
                  name={name}
                  url={external_urls.spotify}
                />
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
  )
};