{% macro generate_schema_name(custom_schema_name, node) -%}

    {%- set default_schema = target.schema -%}
    {%- if custom_schema_name is none -%}

        {{ default_schema }}

    {% elif default_schema == '' %}

        {{ custom_schema_name | trim }}

    {%- else -%}

        {{ custom_schema_name | trim }}_{{ default_schema }}
        
    {%- endif -%}
{%- endmacro %}
