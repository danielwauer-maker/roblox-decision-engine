from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class Granularity(StrEnum):
    ONE_DAY = "OneDay"
    ONE_WEEK = "OneWeek"
    ONE_MONTH = "OneMonth"
    NONE = "None"


class FilterOperation(StrEnum):
    IN = "In"
    NOT_IN = "NotIn"
    GREATER_THAN = "GreaterThan"
    GREATER_THAN_OR_EQUAL = "GreaterThanOrEqual"
    LESS_THAN = "LessThan"
    LESS_THAN_OR_EQUAL = "LessThanOrEqual"
    MATCH = "Match"


class MetricFilter(BaseModel):
    dimension: str
    values: list[str]
    operation: FilterOperation = FilterOperation.IN


class MetricQuery(BaseModel):
    metric: str
    granularity: Granularity = Granularity.ONE_DAY
    start_time: datetime = Field(alias="startTime")
    end_time: datetime = Field(alias="endTime")
    breakdown: list[str] = Field(default_factory=list)
    filter: list[MetricFilter] = Field(default_factory=list)
    limit: int | None = None

    model_config = {"populate_by_name": True}


class Breakdown(BaseModel):
    dimension: str
    value: str
    display_value: str | None = Field(default=None, alias="displayValue")

    model_config = {"populate_by_name": True}


class DataPoint(BaseModel):
    time: datetime
    value: float
    string_values: list[str] | None = Field(default=None, alias="stringValues")
    status: str | None = None

    model_config = {"populate_by_name": True}


class MetricSeries(BaseModel):
    breakdowns: list[Breakdown] = Field(default_factory=list)
    data_points: list[DataPoint] = Field(default_factory=list, alias="dataPoints")

    model_config = {"populate_by_name": True}


class MetricResponse(BaseModel):
    values: list[MetricSeries] = Field(default_factory=list)


class OperationError(BaseModel):
    code: int
    message: str


class MetricOperation(BaseModel):
    path: str
    done: bool
    response: MetricResponse | None = None
    error: OperationError | None = None
