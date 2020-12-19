import { TextareaAutosize } from "@material-ui/core";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import React, { useEffect, useState } from "react";
import { BulletIcon } from "../BulletIcon/BulletIcon";
import "./CollapsibleNoteItem.scss";

export type CollapsibleNote = {
  _id?: string;
  body: string;
  prev?: string;
  parent?: string;
  next?: string;
  children?: CollapsibleNote[];
};

type CollapsibleNoteItemProps = {
  note: CollapsibleNote;
  activeId: string;
  onSave: (note: CollapsibleNote) => void;
  onUnindent?: (note: CollapsibleNote) => void;
  onIndent?: (note: CollapsibleNote) => void;
  onNewNote?: (note: CollapsibleNote) => void;
  onActivate: (note: CollapsibleNote) => void;
};

export const CollapsibleNoteItem: React.FC<CollapsibleNoteItemProps> = (
  props
) => {
  const [body, setBody] = useState(props.note.body);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    function keyDownListener(event: KeyboardEvent) {
      if (props.activeId !== props.note._id) {
        return;
      }

      if (event.key === "Enter") {
        if (!event.shiftKey) {
          handleSave();
          handleNewNote();
          event.preventDefault();
        }
      }

      if (event.key === "Tab") {
        event.preventDefault();
        event.stopPropagation();

        if (event.shiftKey) {
          props.onUnindent && props.onUnindent(props.note);
        } else {
          props.onIndent && props.onIndent(props.note);
        }
      }
    }
    document.addEventListener("keydown", keyDownListener);

    return () => {
      document.removeEventListener("keydown", keyDownListener);
    };
  });

  const handleTextChanged = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(event.currentTarget.value);
  };

  const handleSave = () => {
    if (body === props.note.body) {
      return;
    }

    props.onSave({
      ...props.note,
      body,
    });
  };

  const handleNewNote = () => {
    if (props.onNewNote) {
      props.onNewNote(props.note);
    }
  };

  const handleToggleExpand = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="collapsible-note-item-wrapper">
      <div className="collapsible-note-item">
        <span className="block-expand" onClick={handleToggleExpand}>
          {collapsed ? (
            <ArrowRightIcon fontSize="small" />
          ) : (
            <ArrowDropDownIcon fontSize="small" />
          )}
        </span>
        <BulletIcon />
        <TextareaAutosize
          value={body}
          onChange={handleTextChanged}
          onBlur={handleSave}
          onClick={props.onActivate.bind(this, props.note)}
        />
      </div>
      {!collapsed && props.note.children && (
        <div style={{ marginLeft: "12px" }}>
          {props.note.children.map((childNote) => {
            return (
              <CollapsibleNoteItem
                {...props}
                key={childNote._id}
                note={childNote}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};