// import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
// import { Button } from "../ui/button";

// export function LabelDeleteModal() {
//   return (
//     <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
//       <AlertDialogContent>
//         <AlertDialogHeader>
//           <AlertDialogTitle>Delete label “{editing?.name}”?</AlertDialogTitle>
//         </AlertDialogHeader>
//         <p className="text-sm text-muted-foreground">
//           This action cannot be undone. Tasks using this label will lose the association.
//         </p>
//         <AlertDialogFooter>
//           <Button variant="secondary" onClick={() => setOpenDelete(false)}>
//             Cancel
//           </Button>
//           <Button
//             variant="destructive"
//             onClick={async () => {
//               if (editing) await deleteLabel(editing.id);
//               setOpenDelete(false);
//             }}
//           >
//             Delete
//           </Button>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//     </AlertDialog>
//   );
// }
