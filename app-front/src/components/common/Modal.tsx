'use client'
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";

export function Modal({ id }: { id: number }){
  const modal = createModal({
      id: `modal-${id}`, 
      isOpenedByDefault: false
  });

  const isOpen = useIsModalOpen(modal);

  console.log(`Modal is currently: ${isOpen ? "open" : "closed"}`);

  return (
    <>
      {/* ... */}
      <modal.Component title="foo modal title" concealingBackdrop={true}>
          <h1>Foo modal content {id}</h1>
      </modal.Component>
      <ButtonsGroup
        key={id}
        buttons={[
          {
            children: 'modifier',
            iconId: 'fr-icon-refresh-line',
            priority: "secondary",
            onClick:()=> modal.open()
          },
          {
            children: 'supprimer',
            iconId: 'fr-icon-delete-bin-line',
            linkProps: {
              href: '#'
            },
          },
        ]}
        buttonsSize="small"
        inlineLayoutWhen="lg and up"
      />
    </>
  );
}