import { Radio } from "antd";
import styled from "styled-components";
import { solutions } from "../config";

const StyledSolutions = styled.div`
  .ant-radio-group {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .ant-radio-button-wrapper {
    width: 116px;

    ${({ theme }) => theme.recycle.flexCenter};

    &-disabled {
      color: var(--disabled);
    }
  }
`;

export default function Solutions({ disabled }) {
  return (
    <StyledSolutions>
      <Radio.Group buttonStyle="solid">
        {
          solutions.map((category, idx) => {
            return (
              <Radio.Button
                key={idx}
                value={category}
                disabled={disabled}
              >
                {category}
              </Radio.Button>
            );
          })
        }
      </Radio.Group>
    </StyledSolutions>
  );
}