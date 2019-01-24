import {createElement as el, createElement, ReactElement} from "react";

export const addElementKeys = (elements:Array<ReactElement<any>>) => 
    elements.map((element, index) => {
        const props = element.props == null ? {key: index} : element.props;

        return props.hasOwnProperty("key") 
            ? element
            : el(
                element.type, 
                Object.assign({}, props, 
                    {key: props.hasOwnProperty("id") ? element.props.id : index}
                ),
            )
    });
