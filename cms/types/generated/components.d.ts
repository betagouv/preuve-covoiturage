import type { Schema, Attribute } from '@strapi/strapi';

export interface PageBlock extends Schema.Component {
  collectionName: 'components_block_blocks';
  info: {
    displayName: 'block';
    description: '';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    img: Attribute.Media;
    content: Attribute.RichText & Attribute.Required;
    buttons: Attribute.Component<'shared.button', true>;
  };
}

export interface PageHero extends Schema.Component {
  collectionName: 'components_hero_heroes';
  info: {
    displayName: 'hero';
    description: '';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    subtitle: Attribute.String;
    img: Attribute.Media;
    content: Attribute.RichText & Attribute.Required;
    buttons: Attribute.Component<'shared.button', true>;
  };
}

export interface PageHighlight extends Schema.Component {
  collectionName: 'components_list_highlights';
  info: {
    displayName: 'highlight';
    description: '';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    content: Attribute.RichText & Attribute.Required;
    img: Attribute.Media;
    buttons: Attribute.Component<'shared.button', true>;
  };
}

export interface PageListTitle extends Schema.Component {
  collectionName: 'components_page_list_titles';
  info: {
    displayName: 'list title';
    description: '';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
  };
}

export interface RowAnalyse extends Schema.Component {
  collectionName: 'components_row_analyses';
  info: {
    displayName: 'analysis';
    description: '';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    content: Attribute.RichText & Attribute.Required;
    button: Attribute.Component<'shared.button'>;
  };
}

export interface RowCard extends Schema.Component {
  collectionName: 'components_row_cards';
  info: {
    displayName: 'Card';
    description: '';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    img: Attribute.Media;
    tags: Attribute.Relation<
      'row.card',
      'oneToMany',
      'api::service-tag.service-tag'
    >;
    content: Attribute.RichText & Attribute.Required;
    buttons: Attribute.Component<'shared.button', true>;
  };
}

export interface RowGraph extends Schema.Component {
  collectionName: 'components_row_graphs';
  info: {
    displayName: 'Graph';
    description: '';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    params: Attribute.JSON & Attribute.Required;
  };
}

export interface RowIndicator extends Schema.Component {
  collectionName: 'components_row_indicators';
  info: {
    displayName: 'indicator';
    description: '';
  };
  attributes: {
    info: Attribute.String;
    text: Attribute.String & Attribute.Required;
    unit: Attribute.String;
    value: Attribute.String;
    icon: Attribute.String;
  };
}

export interface RowMap extends Schema.Component {
  collectionName: 'components_row_maps';
  info: {
    displayName: 'Map';
    description: '';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    params: Attribute.JSON & Attribute.Required;
  };
}

export interface RowTitle extends Schema.Component {
  collectionName: 'components_row_titles';
  info: {
    displayName: 'row title';
    description: '';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
  };
}

export interface SharedButton extends Schema.Component {
  collectionName: 'components_button_buttons';
  info: {
    displayName: 'button';
    description: '';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    url: Attribute.String & Attribute.Required;
    icon: Attribute.String;
    color: Attribute.Enumeration<['primary', 'secondary']> &
      Attribute.Required &
      Attribute.DefaultTo<'primary'>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'page.block': PageBlock;
      'page.hero': PageHero;
      'page.highlight': PageHighlight;
      'page.list-title': PageListTitle;
      'row.analyse': RowAnalyse;
      'row.card': RowCard;
      'row.graph': RowGraph;
      'row.indicator': RowIndicator;
      'row.map': RowMap;
      'row.title': RowTitle;
      'shared.button': SharedButton;
    }
  }
}
