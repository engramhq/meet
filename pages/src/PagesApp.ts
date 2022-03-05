import { Div } from "../../ui/components/Div";
import { notesById } from "./data/Notes";
import { PageContent } from "./views/PageContent";
import { Sidebar, SidebarItem } from "./views/Sidebar";

const root = document.getElementById("root");

const sidebarItems = [];
for (const key of Object.keys(notesById)) {
  const note = notesById[key];
  if (note.type !== "page" || note.parent) {
    continue;
  }

  let itemContent = [];
  if (note.content) {
    for (const contentNoteId of note.content) {
      const contentNote = notesById[contentNoteId];

      if (contentNote.type !== "page") {
        continue;
      }
      itemContent.push({
        _id: contentNote._id,
        title: contentNote.body,
      });
    }
  }

  sidebarItems.push({
    _id: note._id,
    title: note.body,
    content: itemContent,
  });
}

const container = Div({
  styles: {
    display: "flex",
  },
});
root.append(container);

container.append(
  Sidebar({
    items: sidebarItems,
    onClick: handlePageClicked,
  })
);

let pageContent = null;

function handlePageClicked(item: SidebarItem) {
  if (pageContent) {
    pageContent.remove();
  }

  pageContent = PageContent(item);
  container.append(pageContent);
}