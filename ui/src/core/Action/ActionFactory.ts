import {
  ArchiveAction,
  BaseAction,
  DirectorAction,
  ElasticsearchAction,
  ForeachAction,
  Icinga2Action,
  LoggerAction,
  ScriptAction,
  SmartMonitoringCheckResultAction,
} from "@/core/Action/Actions";
import {
  ArchivePayload,
  DirectorPayload,
  ElasticsearchPayload,
  ForeachPayload,
  Icinga2Payload,
  LoggerPayload,
  ScriptPayload,
  SmartMonitoringCheckResultPayload,
} from "@/core/Action/Payload";
import { ActionDto } from "tornado-backend-dto";

export class ActionFactory {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static createActionFromDTO(dto: ActionDto): BaseAction {
    // @ts-ignore
    let payload: any;

    switch (dto.id) {
      case "foreach": {
        const actions = dto.payload.actions.map(
          ActionFactory.createActionFromDTO
        );
        const payload = new ForeachPayload(actions, dto.payload.target);
        return new ForeachAction(payload);
      }
      case "archive": {
        payload = new ArchivePayload(
          dto.payload.event,
          dto.payload.archive_type
        );
        return new ArchiveAction(payload);
      }
      case "director": {
        const action_payload = dto.payload.action_payload;
        payload = new DirectorPayload(
          dto.payload.action_name,
          action_payload,
          dto.payload.icinga2_live_creation
        );
        return new DirectorAction(payload);
      }
      case "elasticsearch": {
        const auth = dto.payload.auth;
        const data = dto.payload.data;
        payload = new ElasticsearchPayload(
          auth,
          data,
          dto.payload.endpoint,
          dto.payload.index
        );
        return new ElasticsearchAction(payload);
      }
      case "icinga2": {
        payload = new Icinga2Payload(
          dto.payload.icinga2_action_name,
          dto.payload.icinga2_action_payload
        );
        return new Icinga2Action(payload);
      }
      case "logger": {
        payload = new LoggerPayload();
        return new LoggerAction(payload);
      }
      case "smart_monitoring_check_result": {
        const check_result = dto.payload.check_result;
        const host = dto.payload.host;
        const service = dto.payload.service;
        payload = new SmartMonitoringCheckResultPayload(
          check_result,
          host,
          service
        );
        return new SmartMonitoringCheckResultAction(payload);
      }
      case "script": {
        payload = new ScriptPayload(dto.payload.script, dto.payload.args);
        return new ScriptAction(payload);
      }
      default:
        throw new Error("Unknown action type: " + dto.id);
    }
  }

  public static buildDefaultActionById(actionId: string): BaseAction {
    switch (actionId) {
      case "foreach":
        return this.buildDefaultForeachAction();
      case "archive":
        return this.buildDefaultArchiveAction();
      case "director":
        return this.buildDefaultDirectorAction();
      case "elasticsearch":
        return this.buildDefaultElasticsearchAction();
      case "icinga2":
        return this.buildDefaultIcinga2Action();
      case "logger":
        return this.buildDefaultLoggerAction();
      case "smart_monitoring_check_result":
        return this.buildDefaultSmartMonitoringCheckResultAction();
      case "script":
        return this.buildDefaultScriptAction();
      default:
        throw new Error("Unknown action type: " + actionId);
    }
  }

  public static buildDefaultForeachAction(): ForeachAction {
    return new ForeachAction(new ForeachPayload([], ""));
  }

  public static buildDefaultArchiveAction(): ArchiveAction {
    return new ArchiveAction(new ArchivePayload("${event}", "ARCHIVE TYPE"));
  }

  public static buildDefaultDirectorAction(): DirectorAction {
    return new DirectorAction(new DirectorPayload("", {}, false));
  }

  public static buildDefaultElasticsearchAction(): ElasticsearchAction {
    return new ElasticsearchAction(new ElasticsearchPayload({}, {}, "", 0));
  }

  public static buildDefaultIcinga2Action(): Icinga2Action {
    return new Icinga2Action(
      new Icinga2Payload("process-check-result", {
        exit_status: "0|1|2|3",
        performance_data:
          "METRIC1:VALUE,WARN,CRIT,MIN,MAX METRIC2:VALUE,WARN,CRIT,MIN,MAX",
        plugin_output: "PLUGIN OUTPUT",
        filter: 'host.name=="example.localdomain"',
        type: "Host|Service",
      })
    );
  }

  public static buildDefaultLoggerAction(): LoggerAction {
    return new LoggerAction(new LoggerPayload());
  }

  public static buildDefaultSmartMonitoringCheckResultAction(): SmartMonitoringCheckResultAction {
    return new SmartMonitoringCheckResultAction(
      new SmartMonitoringCheckResultPayload(
        {
          exit_status: "0|1|2|3",
          performance_data:
            "METRIC1=VALUE[UOM];WARN;CRIT;MIN;MAX METRIC2=VALUE[UOM];WARN;CRIT;MIN;MAX",
          plugin_output: "PLUGIN OUTPUT",
        },
        {
          address: "HOST ADDRESS",
          imports: ["HOST TEMPLATE"],
          object_name: "HOST OBJECT NAME",
          vars: {
            created_by: "tornado",
          },
        },
        {
          imports: ["SERVICE TEMPLATE"],
          object_name: "SERVICE NAME",
          vars: {
            created_by: "tornado",
          },
        }
      )
    );
  }

  public static buildDefaultScriptAction(): ScriptAction {
    return new ScriptAction(new ScriptPayload("FULL PATH TO SCRIPT", []));
  }

  public static buildForeachAction(
    target: string,
    actions: BaseAction[]
  ): ForeachAction {
    return new ForeachAction(new ForeachPayload(actions, target));
  }
}
