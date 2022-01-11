import React from "react";

import { styled }from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { Track } from "../Track";
import { columns, collapseStyling } from "./columns";

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
  return (
    <TableContainer>
      <Table aria-label="playlist tracks">
        <TableHead>
          <TableRow>
            {Object.entries(columns)
              .map(([key, column]) => {
                const { align, collapse, label, sx } = column;
                const collapseSx = collapseStyling(collapse, "table-cell");
                return (
                  <HeadTableCell
                    key={key}
                    align={align}
                    sx={{
                      ...sx,
                      ...collapseSx
                    }}
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
              const { album, artists, duration_ms, id, name, external_urls } = track;
              return (
                <Track 
                  key={id}
                  addedAt={added_at}
                  album={album}
                  artists={artists}
                  duration={duration_ms}
                  index={i + 1}
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