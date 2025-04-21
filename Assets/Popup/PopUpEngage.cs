using System.Collections;
using TMPro;
using UnityEngine;
using System.Collections.Generic;
public class PopUpEngage : MonoBehaviour
{
    public TMP_Text popupText;

    private GameObject window;
    private Animator popupAnimator;
    private Queue<string> popupQueue;
    private bool isActive;
    private Coroutine queueChecker;

    private void Start()
    {
        window = transform.GetChild(0).gameObject;
        popupAnimator = window.GetComponent<Animator>();
        window.SetActive(false);
        popupQueue = new Queue<string>();
    }

    public void AddToQueue(string text){
        popupQueue.Enqueue(text);
        if(queueChecker==null)
            queueChecker = StartCoroutine(CheckQueue());
    }

    private void ShowPopup(string text){
        isActive = true;
        window.SetActive(true);
        popupText.text = text;
        popupAnimator.Play("Popup");
    }

    private IEnumerator CheckQueue(){
        do {
            ShowPopup(popupQueue.Dequeue());
            do {
                yield return null;
            } while (!popupAnimator.GetCurrentAnimatorStateInfo(0).IsTag("Idle"));
        } while (popupQueue.Count > 0);
        isActive = false;
        window.SetActive(false);
        queueChecker = null;
    }
     private void OnTrigger2D(Collider2D collision)
    {
        if (collision.tag == "Player"){
            Debug.Log("Detected");
        }
    }
}
