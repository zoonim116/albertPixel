import {registerFormatType, applyFormat, getActiveFormat, removeFormat, toggleFormat} from '@wordpress/rich-text';
import {RichTextToolbarButton, URLInput} from '@wordpress/block-editor'
import {BaseControl, Button, Flex, FlexItem, Popover, TextControl} from "@wordpress/components";
import { SVG, Path, Rect, G } from "@wordpress/primitives";
import {fbPixelPopover} from "./albert_pixel.scss";
import {compose, ifCondition, withState} from "@wordpress/compose";
import { withSelect, useSelect } from "@wordpress/data";
import {getRectangleFromRange} from "@wordpress/dom";
import {useState} from "@wordpress/element";



let anchorRange;
let state = false;


const AlbertPixelButton = withState({
  hrefUrl: ''
}) (({isActive, value, onChange, setState, setAttributes}) => {
  const [ showPopover, setShowPopover ] = useState( false );
  const [ hrefUrl, setHrefUrl ] = useState( '' );
  return (
    <>
      <RichTextToolbarButton
        icon='edit'
        title={"Lead URL"}
        isActive={isActive}
        shortcutType={"primary"}
        onClick={() => setState((state) => {
          const isFbPixel = getActiveFormat( value, 'vicky/albert-pixel' );
          const selection = window.getSelection();
          anchorRange =
            selection.rangeCount > 0 ? selection.getRangeAt( 0 ) : null;
          if (typeof isFbPixel !== 'undefined' && showPopover == false) {
            if (Object.keys(isFbPixel.attributes).length > 0) {
              state.hrefUrl = isFbPixel.attributes.href;
              setHrefUrl(isFbPixel.attributes.href);
            } else if (typeof isFbPixel.unregisteredAttributes != "undefined" && Object.keys(isFbPixel.unregisteredAttributes).length > 0 && showPopover == false){
              setHrefUrl(isFbPixel.unregisteredAttributes.href);
            }
          }
          setShowPopover(true);
        })}
      />
      {showPopover && (
        <Popover position={"bottom center"} className={"fb-pixel-popover"} focusOnMount={"container"}
                 onClose={() => {
                   setHrefUrl('');
                   setShowPopover(false);
                 }} onFocusOutside={() => {
          setHrefUrl('');
          setShowPopover(false);
        }}
                 getAnchorRect={() => {
                   return getRectangleFromRange(anchorRange);
                 }}
        >
          <Flex className={"fb-pixel-flex-wrap"}>
            <FlexItem>
              <BaseControl help={"Enter website URL"}>
                <TextControl label={"URL"} type={"url"} value={hrefUrl} onChange={(value) => {
                  setHrefUrl(value)
                }}/>
              </BaseControl>
            </FlexItem>
            <FlexItem>
              <Button isPrimary={true} onClick={() => {
                if(hrefUrl.length > 0) {
                  onChange( applyFormat(value, {
                    type: 'vicky/albert-pixel',
                    attributes: {
                      href: hrefUrl,
                      target: "_blank"
                    }
                  }) );
                } else {
                  onChange( toggleFormat(value, {
                    type: 'vicky/albert-pixel',
                  }) );
                }
                setHrefUrl('');
                setShowPopover(false);

              }}>Save</Button>
              <Button isSecondary={true} className="unlink-btn" onClick={() => {

                onChange( toggleFormat(value, {
                  type: 'vicky/albert-pixel',
                }) );
                setHrefUrl('');
                setShowPopover(false);
              }}>
                Unlink
              </Button>
            </FlexItem>
          </Flex>
        </Popover>
      )}
    </>
  );
});

const AlbertPixelButtonDisplay = compose(
  withSelect( function ( select ) {
    return {
      selectedBlock: select( 'core/block-editor' ).getSelectedBlock(),
    };
  } ),
  ifCondition( function ( props ) {
    return (
      props.selectedBlock && (props.selectedBlock.name === 'core/paragraph' || props.selectedBlock.name === 'core/list')
    );
  })
)(AlbertPixelButton);



registerFormatType('vicky/albert-pixel', {
  title: ' Lead URL',
  tagName: 'a',
  className: 'albert-lead',
  active: false,
  attributes: {
    href: "",
    target: ""
  },
  edit: AlbertPixelButtonDisplay,
})
