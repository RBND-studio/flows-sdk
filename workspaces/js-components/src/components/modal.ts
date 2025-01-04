export interface ModalProps {
  title: string;
  body: string;
  continueText?: string;
  showCloseButton: boolean;
  hideOverlay: boolean;

  continue: () => void;
  close: () => void;
}

// export const Modal = (props: ModalProps): HTMLElement => {
//   return `<div class="flows_modal_wrapper">
//         <div class="flows_modal_modal">
//           <p class="flows_text flows_text_title">${props.title}</p>
//           <p class="flows_text flows_text_body">${props.body}</p>

//           <div class="flows_modal_footer">
//             ${props.continueText && `<button >${props.continueText}</button>`}
//           </div>
//         </div>
//       </div>`;
// };
