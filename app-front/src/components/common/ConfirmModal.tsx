import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { type ReactNode, useEffect, useId, useState } from "react";

export type ModalProps = {
  open: boolean;
  title: string;
  children?: ReactNode;
  onClose: () => void;
};

export type ModalResponse = {
  doProceed: boolean;
};

export function ConfirmModal(props: ModalProps) {
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
          children: "Ok",
          onClick: () => {
            props.onClose();
          },
        },
      ]}
      concealingBackdrop={true}
    >
      {props.children}
    </modal.Component>
  );
}
