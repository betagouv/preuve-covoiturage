import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { type ReactNode, useEffect, useId, useState } from "react";

export type ModalProps = {
  open: boolean;
  title: string;
  children?: ReactNode;
  onClose: () => void;
  onOpen?: () => Promise<void>;
  onSubmit: () => Promise<void>;
};

export type ModalResponse = {
  doProceed: boolean;
};

export function Modal(props: ModalProps) {
  const id = useId();
  const [modal] = useState(() =>
    createModal({
      id: `modal-${id}`,
      isOpenedByDefault: false,
    }),
  );

  useEffect(() => {
    if (props.open) {
      modal.open();
      if (props.onOpen) {
        void props.onOpen();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open]);

  useIsModalOpen(modal, {
    onConceal: () => {
      props.onClose();
    },
  });

  return (
    <modal.Component
      title={props.title}
      buttons={[
        {
          children: "Annuler",
          onClick: () => {
            props.onClose();
          },
        },
        {
          children: "Ok",
          onClick: () => {
            props.onClose();
            void props.onSubmit();
          },
        },
      ]}
      concealingBackdrop={true}
    >
      {props.children}
    </modal.Component>
  );
}
